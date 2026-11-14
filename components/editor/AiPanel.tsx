"use client";

import * as React from "react";
import {
  Sparkles,
  X,
  Square,
  AlertCircle,
  Wand2,
  RefreshCw,
  Loader2,
  GripHorizontal,
  Check,
  CornerDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamAiCompletion } from "@/lib/api/ai";

interface AiPanelProps {
  open: boolean;
  onClose: () => void;
  editor: any;
  defaultFeature?: "compose" | "rephrase";
  onPostContentChanged?: () => void;
}

export function AiPanel({
  open,
  onClose,
  editor,
  defaultFeature = "compose",
  onPostContentChanged,
}: AiPanelProps) {
  const [feature, setFeature] = React.useState<"compose" | "rephrase">(defaultFeature);

  React.useEffect(() => {
    if (open && defaultFeature) {
      setFeature(defaultFeature);
    }
  }, [open, defaultFeature]);
  const [prompt, setPrompt] = React.useState("");
  const [selectedText, setSelectedText] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [rephrasedOutput, setRephrasedOutput] = React.useState("");
  const [composePreview, setComposePreview] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = React.useState(false);
  const [isBehindText, setIsBehindText] = React.useState(false);

  // Drag state for moveable modal
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  } | null>(null);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const activeBlockIdRef = React.useRef<string | null>(null);
  const accumulatedTextRef = React.useRef<string>("");

  // 1. Live selection tracking & cursor position checking
  React.useEffect(() => {
    if (!open || !editor) return;

    const checkEditorState = () => {
      try {
        // Track selection
        const text =
          editor.getSelectedText?.() || window.getSelection()?.toString() || "";
        const trimmed = text.trim();
        if (trimmed) {
          setSelectedText(trimmed);
          setFeature("rephrase");
        } else {
          setSelectedText("");
        }

        // Check cursor position for compose
        const cursor = editor.getTextCursorPosition?.();
        if (cursor?.block) {
          const content = cursor.block.content;
          let blockText = "";
          if (Array.isArray(content)) {
            blockText = content.map((c: any) => c.text || "").join("");
          } else if (typeof content === "string") {
            blockText = content;
          }
          setIsBehindText(blockText.trim().length > 0);
        } else {
          setIsBehindText(false);
        }
      } catch {
        // ignore selection exceptions
      }
    };

    checkEditorState();
    document.addEventListener("selectionchange", checkEditorState);
    return () => {
      document.removeEventListener("selectionchange", checkEditorState);
    };
  }, [open, editor]);

  // 2. Drag / Move Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, a")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: rect.left,
      posY: rect.top,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;
      const newX = Math.max(
        10,
        Math.min(window.innerWidth - rect.width - 10, dragRef.current.posX + deltaX)
      );
      const newY = Math.max(
        10,
        Math.min(window.innerHeight - rect.height - 10, dragRef.current.posY + deltaY)
      );
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 3. Clean abort when panel closes
  const handleClose = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setError(null);
    setRephrasedOutput("");
    setComposePreview("");
    onClose();
  }, [onClose]);

  const handleStopGenerating = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    if (activeBlockIdRef.current && accumulatedTextRef.current && editor) {
      try {
        const parsedBlocks = await editor.tryParseMarkdownToBlocks(
          accumulatedTextRef.current
        );
        if (parsedBlocks && parsedBlocks.length > 0) {
          editor.replaceBlocks([activeBlockIdRef.current], parsedBlocks);
        }
      } catch (err) {
        console.error("Failed to parse markdown on stop:", err);
      }
    }

    onPostContentChanged?.();
  };

  // Helper to insert a fresh empty line at cursor for compose
  const handleInsertNewLine = () => {
    if (!editor) return;
    try {
      const cursor = editor.getTextCursorPosition?.();
      const referenceBlock =
        cursor?.block ||
        (editor.document?.length > 0
          ? editor.document[editor.document.length - 1]
          : null);

      if (referenceBlock) {
        const [newBlock] = editor.insertBlocks(
          [{ type: "paragraph", content: "" }],
          referenceBlock,
          "after"
        );
        if (newBlock) {
          editor.setTextCursorPosition?.(newBlock, "start");
          setIsBehindText(false);
        }
      }
    } catch (err) {
      console.error("Failed to insert new line:", err);
    }
  };

  // 4. Generate AI Completion
  const handleGenerate = async () => {
    if (!editor) return;

    setError(null);
    setIsRateLimited(false);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let targetBlockId: string | null = null;
    let accumulated = "";

    try {
      if (feature === "compose") {
        setComposePreview("");

        // Find cursor block or append block
        const cursor = editor.getTextCursorPosition?.();
        const referenceBlock =
          cursor?.block ||
          (editor.document?.length > 0
            ? editor.document[editor.document.length - 1]
            : null);

        // Insert new block
        const insertedBlocks = editor.insertBlocks(
          [{ type: "paragraph", content: "" }],
          referenceBlock,
          referenceBlock ? "after" : "before"
        );

        if (insertedBlocks && insertedBlocks.length > 0) {
          targetBlockId = insertedBlocks[0].id;
          activeBlockIdRef.current = targetBlockId;
        }

        // Get context from surrounding blocks
        let contextText = "";
        if (referenceBlock?.content) {
          contextText = Array.isArray(referenceBlock.content)
            ? referenceBlock.content.map((c: any) => c.text || "").join("")
            : String(referenceBlock.content);
        }

        await streamAiCompletion({
          feature: "compose",
          prompt,
          context: contextText,
          signal: controller.signal,
          onToken: (token) => {
            accumulated += token;
            accumulatedTextRef.current = accumulated;
            setComposePreview(accumulated);
            if (targetBlockId) {
              editor.updateBlock(targetBlockId, {
                content: accumulated,
              });
            }
          },
          onComplete: async () => {
            setIsStreaming(false);
            setPrompt("");
            if (targetBlockId) {
              try {
                const parsedBlocks = await editor.tryParseMarkdownToBlocks(
                  accumulated
                );
                if (parsedBlocks && parsedBlocks.length > 0) {
                  editor.replaceBlocks([targetBlockId], parsedBlocks);
                }
              } catch (parseErr) {
                console.error("Markdown parse error on complete:", parseErr);
              }
            }
            onPostContentChanged?.();
          },
          onError: (err, isLimit) => {
            setIsStreaming(false);
            if (isLimit) {
              setIsRateLimited(true);
              setError("You've reached your daily AI limit. Upgrade your plan.");
            } else {
              setError(err.message || "Failed to generate AI completion.");
            }
          },
        });
      } else if (feature === "rephrase") {
        // Rephrase: DO NOT directly overwrite editor block!
        // Show output in panel and let user choose.
        setRephrasedOutput("");

        const selection = editor.getSelection?.();
        const targetBlock =
          selection?.blocks?.[0] || editor.getTextCursorPosition?.()?.block;

        const textToRephrase =
          selectedText ||
          (targetBlock?.content
            ? Array.isArray(targetBlock.content)
              ? targetBlock.content.map((c: any) => c.text || "").join("")
              : String(targetBlock.content || "")
            : "");

        if (!textToRephrase.trim()) {
          setError("Please highlight text in the editor to rephrase.");
          setIsStreaming(false);
          return;
        }

        await streamAiCompletion({
          feature: "rephrase",
          context: textToRephrase,
          signal: controller.signal,
          onToken: (token) => {
            accumulated += token;
            setRephrasedOutput(accumulated);
          },
          onComplete: () => {
            setIsStreaming(false);
          },
          onError: (err, isLimit) => {
            setIsStreaming(false);
            if (isLimit) {
              setIsRateLimited(true);
              setError("You've reached your daily AI limit. Upgrade your plan.");
            } else {
              setError(err.message || "Failed to rephrase text.");
            }
          },
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "An unexpected error occurred.");
      }
      setIsStreaming(false);
    }
  };

  // 5. Apply rephrased text to editor
  const handleApplyRephrase = async () => {
    if (!editor || !rephrasedOutput) return;

    try {
      const selection = editor.getSelection?.();
      const targetBlock =
        selection?.blocks?.[0] || editor.getTextCursorPosition?.()?.block;

      if (targetBlock) {
        try {
          const parsedBlocks = await editor.tryParseMarkdownToBlocks(
            rephrasedOutput
          );
          if (parsedBlocks && parsedBlocks.length > 0) {
            editor.replaceBlocks([targetBlock.id], parsedBlocks);
          } else {
            editor.updateBlock(targetBlock.id, {
              content: rephrasedOutput,
            });
          }
        } catch {
          editor.updateBlock(targetBlock.id, {
            content: rephrasedOutput,
          });
        }
        onPostContentChanged?.();
      }
      setRephrasedOutput("");
      setSelectedText("");
    } catch (err) {
      console.error("Failed to apply rephrase:", err);
    }
  };

  const handleDiscardRephrase = () => {
    setRephrasedOutput("");
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="AI Writing Assistant"
      style={
        position
          ? {
              top: `${position.y}px`,
              left: `${position.x}px`,
              bottom: "auto",
              right: "auto",
            }
          : undefined
      }
      className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-background p-5 shadow-2xl animate-in fade-in duration-200 flex flex-col gap-3.5 font-sans"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between border-b border-border/60 pb-3 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-foreground text-background">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm leading-none flex items-center gap-1.5">
              Blogology AI
              <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/40" />
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Drag to reposition
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close AI panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Selector Tabs (Compose & Rephrase only) */}
      <div className="flex items-center rounded-lg bg-secondary/40 p-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setFeature("compose");
            setError(null);
          }}
          disabled={isStreaming}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            feature === "compose"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Compose
        </button>
        <button
          type="button"
          onClick={() => {
            setFeature("rephrase");
            setError(null);
          }}
          disabled={isStreaming}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            feature === "rephrase"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rephrase
        </button>
      </div>

      {/* Rate Limit Banner */}
      {isRateLimited && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Daily AI Limit Reached</p>
            <p className="mt-0.5 opacity-90">
              You&apos;ve reached your daily AI limit. Upgrade your plan.
            </p>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {error && !isRateLimited && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Mode 1: Compose */}
      {feature === "compose" && (
        <div className="flex flex-col gap-2.5">
          {/* Warning if cursor is behind existing word/character */}
          {isBehindText && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <p className="font-medium">Place cursor on a new line</p>
                <p className="text-[11px] opacity-90">
                  The cursor is currently placed behind existing text. Move to a new line to draft.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleInsertNewLine}
                  className="h-7 px-2.5 text-[11px] rounded-full gap-1 border-amber-500/30 hover:bg-amber-500/20"
                >
                  <CornerDownLeft className="w-3 h-3" />
                  Insert new line
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isStreaming}
              rows={3}
              placeholder="What would you like AI to draft? (e.g. Write an introduction discussing cache stampedes...)"
              className="w-full rounded-xl border border-border bg-secondary/20 p-3 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && prompt.trim() && !isBehindText) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Streams directly into a new block at cursor position.
            </p>
          </div>

          {isStreaming && (
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground shrink-0" />
              <span className="text-muted-foreground truncate">
                Drafting into story: &ldquo;{composePreview.slice(-40)}&rdquo;
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Rephrase */}
      {feature === "rephrase" && (
        <div className="flex flex-col gap-3">
          {/* Live Selected Text Preview */}
          <div className="p-2.5 rounded-xl border border-border bg-secondary/20 text-xs space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Live Selected Text:
            </span>
            {selectedText ? (
              <p className="text-foreground/90 italic line-clamp-3 leading-relaxed">
                &ldquo;{selectedText}&rdquo;
              </p>
            ) : (
              <p className="text-muted-foreground text-[11px]">
                Highlight any text in the story to rephrase it.
              </p>
            )}
          </div>

          {/* Rephrased Output Preview (shows output before replacing) */}
          {rephrasedOutput && (
            <div className="p-3 rounded-xl border border-border bg-secondary/40 text-xs space-y-2 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider block">
                Rephrased Suggestion:
              </span>
              <p className="text-foreground leading-relaxed">
                {rephrasedOutput}
              </p>

              {!isStreaming && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplyRephrase}
                    className="h-7 px-3 text-[11px] rounded-full gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Replace selection
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardRephrase}
                    className="h-7 px-3 text-[11px] rounded-full"
                  >
                    Discard
                  </Button>
                </div>
              )}
            </div>
          )}

          {isStreaming && (
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground shrink-0" />
              <span className="text-muted-foreground">Generating rephrased version…</span>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        {isStreaming ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStopGenerating}
            className="w-full rounded-full text-xs font-medium gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop generating
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={
              (feature === "compose" && (!prompt.trim() || isBehindText)) ||
              (feature === "rephrase" && !selectedText.trim())
            }
            className="w-full rounded-full text-xs font-medium gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {feature === "compose" ? "Draft section" : "Generate rephrase"}
          </Button>
        )}
      </div>
    </div>
  );
}
