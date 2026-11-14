"use client";

import * as React from "react";
import { Sparkles, Square, CornerDownLeft, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamAiCompletion } from "@/lib/api/ai";

interface InlineAiWriterProps {
  editor: any;
  isOpen: boolean;
  targetBlockId: string | null;
  warningMessage?: string | null;
  onClose: () => void;
  onPostContentChanged?: () => void;
}

export function InlineAiWriter({
  editor,
  isOpen,
  targetBlockId,
  warningMessage,
  onClose,
  onPostContentChanged,
}: InlineAiWriterProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(targetBlockId);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    setActiveBlockId(targetBlockId);
  }, [targetBlockId]);

  React.useEffect(() => {
    if (isOpen) {
      setPrompt("");
      setError(null);
      if (!warningMessage) {
        setTimeout(() => inputRef.current?.focus(), 60);
      }
    }
  }, [isOpen, warningMessage]);

  // Auto-dismiss warning message after 4.5 seconds
  React.useEffect(() => {
    if (isOpen && warningMessage) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, warningMessage, onClose]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    onClose();
  };

  const handleStopGenerating = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    onPostContentChanged?.();
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || !editor || isStreaming) return;

    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Use current active block or fallback to cursor block
    let blockToStreamInto = activeBlockId;
    if (!blockToStreamInto) {
      const cursor = editor.getTextCursorPosition?.();
      blockToStreamInto = cursor?.block?.id;
    }

    // If still no block, insert one at the end
    if (!blockToStreamInto) {
      const inserted = editor.insertBlocks(
        [{ type: "paragraph", content: "" }],
        editor.document[editor.document.length - 1],
        "after"
      );
      blockToStreamInto = inserted[0]?.id;
    }

    if (!blockToStreamInto) {
      setError("Unable to locate insertion point in editor.");
      setIsStreaming(false);
      return;
    }

    // Clear the placeholder block to receive streamed tokens
    editor.updateBlock(blockToStreamInto, { content: "" });

    let accumulated = "";
    let scrollRaf: number | null = null;

    try {
      await streamAiCompletion({
        feature: "compose",
        prompt: prompt.trim(),
        signal: controller.signal,
        onToken: (token) => {
          accumulated += token;
          if (blockToStreamInto) {
            editor.updateBlock(blockToStreamInto, {
              content: accumulated,
            });

            // Smooth auto-scroll following the end of streamed text like Gemini / ChatGPT
            if (!scrollRaf) {
              scrollRaf = requestAnimationFrame(() => {
                scrollRaf = null;
                const el = document.querySelector(`[data-id="${blockToStreamInto}"]`);
                if (el) {
                  // Keep the bottom of the streaming block in view until the end
                  el.scrollIntoView({ behavior: "auto", block: "end" });
                  // Extra scroll offset so content is never obscured by the bottom floating dock
                  window.scrollBy({ top: 90, behavior: "auto" });
                }
              });
            }
          }
        },
        onComplete: async () => {
          if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = null;
          }
          setIsStreaming(false);
          if (blockToStreamInto && accumulated.trim()) {
            try {
              const parsedBlocks = await editor.tryParseMarkdownToBlocks(accumulated);
              if (parsedBlocks && parsedBlocks.length > 0) {
                editor.replaceBlocks([blockToStreamInto], parsedBlocks);
                // Ensure the final generated blocks stay in view
                const lastBlockId = parsedBlocks[parsedBlocks.length - 1]?.id;
                if (lastBlockId) {
                  setTimeout(() => {
                    const lastEl = document.querySelector(`[data-id="${lastBlockId}"]`);
                    if (lastEl) {
                      lastEl.scrollIntoView({ behavior: "smooth", block: "end" });
                      window.scrollBy({ top: 90, behavior: "auto" });
                    }
                  }, 50);
                }
              }
            } catch (err) {
              console.error("Failed to parse markdown blocks:", err);
            }
          }
          onPostContentChanged?.();
          onClose();
        },
        onError: (err, isLimit) => {
          if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = null;
          }
          setIsStreaming(false);
          setError(
            isLimit
              ? "You have reached your daily AI limit. Please try again tomorrow."
              : err.message || "Failed to generate story content."
          );
        },
      });
    } catch (err: any) {
      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = null;
      }
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to generate story content.");
      }
      setIsStreaming(false);
    }
  };

  if (!isOpen) return null;

  // Warning state (cursor behind existing text)
  if (warningMessage) {
    return (
      <div className="w-full my-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 text-xs font-sans animate-in fade-in duration-150">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{warningMessage}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-amber-500/20 text-muted-foreground hover:text-foreground transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Active streaming state
  if (isStreaming) {
    return (
      <div className="w-full my-2 p-2.5 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-sm flex items-center justify-between gap-3 font-sans animate-in fade-in duration-150">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
          <span className="font-medium text-foreground">Drafting story with AI…</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStopGenerating}
          className="h-7 px-3 text-[11px] rounded-full gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>Stop</span>
        </Button>
      </div>
    );
  }

  // Input prompt state
  return (
    <div className="w-full my-2 p-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg flex flex-col gap-1.5 font-sans animate-in fade-in duration-150">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-foreground text-background shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like to write about? (Press Enter)..."
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:ring-0 px-1 py-1"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              handleCancel();
            }
          }}
        />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="submit"
            size="sm"
            disabled={!prompt.trim()}
            className="h-7 px-3 text-[11px] rounded-full gap-1 font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-40"
          >
            <span>Write</span>
            <CornerDownLeft className="w-3 h-3 opacity-70" />
          </Button>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {error && (
        <div className="px-2 pb-1 text-[11px] text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
