"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Sparkles, Check, X, ChevronDown, Loader2 } from "lucide-react";
import { useBlockNoteEditor } from "@blocknote/react";
import { streamAiCompletion } from "@/lib/api/ai";

interface AiRephraseToolbarButtonProps {
  editor?: any;
  onPostContentChanged?: () => void;
}

const TONES = [
  { label: "Punchy & Concise", value: "punchy, direct, and concise" },
  { label: "Professional & Polished", value: "professional, elegant, and polished" },
  { label: "Casual & Engaging", value: "conversational, warm, and engaging" },
  { label: "Persuasive & Compelling", value: "persuasive, high-conviction, and impactful" },
  { label: "Analytical & Academic", value: "analytical, structured, and precise" },
];

export function AiRephraseToolbarButton({
  editor: propEditor,
  onPostContentChanged,
}: AiRephraseToolbarButtonProps) {
  const contextEditor = useBlockNoteEditor();
  const editor = propEditor || contextEditor;

  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedTone, setSelectedTone] = React.useState<string | null>(null);
  const [rephrasedText, setRephrasedText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Use refs to ensure target blocks and highlighted text cannot be lost across re-renders
  const targetBlockIdsRef = React.useRef<string[]>([]);
  const selectedTextRef = React.useRef<string>("");

  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  const [menuCoords, setMenuCoords] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    const menuHeight = 220;
    const showAbove = rect.bottom + menuHeight > window.innerHeight && rect.top > menuHeight;

    setMenuCoords({
      top: showAbove ? Math.max(10, rect.top - menuHeight - 6) : rect.bottom + 6,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 240)),
    });
  }, []);

  React.useEffect(() => {
    if (menuOpen || isGenerating || rephrasedText || error) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [menuOpen, isGenerating, rephrasedText, error, updateCoords]);

  // Close tone menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Capture selection and block targets as soon as user opens the menu
  const captureCurrentTargets = React.useCallback(() => {
    if (!editor) return;

    const selectedText = editor.getSelectedText?.() || "";
    if (selectedText) {
      selectedTextRef.current = selectedText;
    }

    const selection = editor.getSelection?.();
    const blocks = selection?.blocks || [];
    const currentBlock = blocks[0] || editor.getTextCursorPosition?.()?.block;

    if (currentBlock) {
      const blockIds = blocks.length > 0 ? blocks.map((b: any) => b.id) : [currentBlock.id];
      targetBlockIdsRef.current = blockIds;
    }
  }, [editor]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    captureCurrentTargets();
    updateCoords();
    setMenuOpen((prev) => !prev);
  };

  const handleSelectTone = async (toneObj: (typeof TONES)[number]) => {
    if (!editor || isGenerating) return;

    setMenuOpen(false);
    setSelectedTone(toneObj.label);
    setError(null);
    setRephrasedText("");
    setIsGenerating(true);

    try {
      // Re-check selection or use captured
      captureCurrentTargets();

      let targetIds = targetBlockIdsRef.current;
      let textToRephrase = selectedTextRef.current;

      // If text not captured, extract from current block
      if (!textToRephrase && targetIds.length > 0) {
        const blk = editor.getBlock(targetIds[0]);
        if (blk?.content) {
          textToRephrase = Array.isArray(blk.content)
            ? blk.content.map((c: any) => c.text || "").join("")
            : String(blk.content);
        }
      }

      // Fallback: check cursor block
      if (!textToRephrase) {
        const cursorBlock = editor.getTextCursorPosition?.()?.block;
        if (cursorBlock) {
          targetIds = [cursorBlock.id];
          targetBlockIdsRef.current = targetIds;
          textToRephrase = Array.isArray(cursorBlock.content)
            ? cursorBlock.content.map((c: any) => c.text || "").join("")
            : String(cursorBlock.content);
        }
      }

      if (!textToRephrase?.trim()) {
        setError("Please highlight text or place cursor in a block to rephrase.");
        setIsGenerating(false);
        return;
      }

      let accumulated = "";
      await streamAiCompletion({
        feature: "rephrase",
        context: textToRephrase.trim(),
        tone: toneObj.value,
        onToken: (token) => {
          accumulated += token;
          setRephrasedText(accumulated);
        },
        onComplete: () => {
          setIsGenerating(false);
        },
        onError: (err, isLimit) => {
          setIsGenerating(false);
          setError(
            isLimit
              ? "Daily AI limit reached."
              : err.message || "Failed to rephrase."
          );
        },
      });
    } catch (err: any) {
      setIsGenerating(false);
      setError(err.message || "Failed to rephrase.");
    }
  };

  const handleApplyReplacement = () => {
    const textToApply = rephrasedText.trim();
    if (!editor || !textToApply) return;

    let targetId = targetBlockIdsRef.current[0];
    let targetBlock: any = null;

    if (targetId) {
      targetBlock = editor.getBlock(targetId);
    }

    // Fallback if ID was not found
    if (!targetBlock) {
      const cursorBlock = editor.getTextCursorPosition?.()?.block;
      targetBlock = cursorBlock || editor.document?.[0];
      if (targetBlock) {
        targetId = targetBlock.id;
      }
    }

    if (!targetId || !targetBlock) {
      setError("Unable to locate block in editor to replace.");
      return;
    }

    const capturedSelectedText = selectedTextRef.current?.trim();
    const currentBlockContent = Array.isArray(targetBlock.content)
      ? targetBlock.content.map((c: any) => c.text || "").join("")
      : String(targetBlock.content || "");

    try {
      // 1. If only a substring was highlighted and exists in the block, replace just that substring
      if (
        capturedSelectedText &&
        capturedSelectedText !== currentBlockContent.trim() &&
        currentBlockContent.includes(capturedSelectedText)
      ) {
        const updatedContent = currentBlockContent.replace(
          capturedSelectedText,
          textToApply
        );
        editor.updateBlock(targetId, {
          content: updatedContent,
        });
      } else {
        // 2. Full block replacement (try markdown parsing first for headings, lists, bold)
        let replaced = false;
        try {
          const parsedBlocks = editor.tryParseMarkdownToBlocks(textToApply);
          if (parsedBlocks && parsedBlocks.length > 0) {
            editor.replaceBlocks([targetId], parsedBlocks);
            replaced = true;
          }
        } catch {
          // Parsing fallback
        }

        if (!replaced) {
          editor.updateBlock(targetId, {
            content: textToApply,
          });
        }
      }

      onPostContentChanged?.();
    } catch {
      // Direct update fallback
      try {
        editor.updateBlock(targetId, {
          content: textToApply,
        });
        onPostContentChanged?.();
      } catch (err2) {
        console.error("Replacement failed:", err2);
      }
    }

    // Reset popover state
    setRephrasedText("");
    setSelectedTone(null);
    targetBlockIdsRef.current = [];
    selectedTextRef.current = "";
    setError(null);
  };

  const handleDiscard = () => {
    setRephrasedText("");
    setSelectedTone(null);
    targetBlockIdsRef.current = [];
    selectedTextRef.current = "";
    setError(null);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Main Toolbar Button inside bn-toolbar */}
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => {
          // Prevent losing BlockNote text selection
          e.preventDefault();
        }}
        onClick={handleToggleMenu}
        className="bn-button flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
        title="Rephrase with custom tone"
      >
        <Sparkles className="w-3.5 h-3.5 text-foreground" />
        <span>Rephrase</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground opacity-70" />
      </button>

      {/* Tone Selection Dropdown - Portaled outside bn-toolbar to escape clipping */}
      {mounted && menuOpen && menuCoords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuCoords.top,
            left: menuCoords.left,
            zIndex: 99999,
          }}
          onMouseDown={(e) => {
            // Prevent clearing editor selection on interaction
            e.preventDefault();
          }}
          className="w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5 text-xs font-sans"
        >
          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
            Choose Tone:
          </div>
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectTone(t)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Inline Floating Preview & Decision Popover - Portaled outside bn-toolbar */}
      {mounted && (isGenerating || rephrasedText || error) && menuCoords && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: menuCoords.top,
            left: menuCoords.left,
            zIndex: 99999,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-84 max-w-[90vw] rounded-2xl border border-border bg-card/95 backdrop-blur-md p-3.5 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col gap-2.5 text-xs font-sans"
        >
          <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
            <span className="text-[10px] font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-foreground" />
              Rephrased ({selectedTone || "Custom Tone"})
            </span>
            <button
              type="button"
              onClick={handleDiscard}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {isGenerating && !rephrasedText && (
            <div className="flex items-center gap-2 text-muted-foreground py-2 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating rephrased version...</span>
            </div>
          )}

          {rephrasedText && (
            <p className="text-foreground text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {rephrasedText}
            </p>
          )}

          {error && (
            <p className="text-destructive text-xs">{error}</p>
          )}

          {rephrasedText && !isGenerating && (
            <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-border/50">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleDiscard}
                className="px-2.5 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleApplyReplacement}
                className="px-3 py-1 rounded-full text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Replace
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
