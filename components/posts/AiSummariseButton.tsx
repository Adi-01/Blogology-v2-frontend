"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, X, Loader2, Square, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamAiCompletion } from "@/lib/api/ai";
import { AiSmoothStreamResponse } from "@/components/shared/AiSmoothStreamResponse";

interface AiSummariseButtonProps {
  postId: string;
  initialSummary?: string | null;
  postContent: any;
  isAuthenticated?: boolean;
}

function extractTextFromBlocks(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (!block) return "";
        if (typeof block === "string") return block;
        if (Array.isArray(block.content)) {
          return block.content.map((c: any) => c.text || "").join("");
        }
        if (typeof block.content === "string") return block.content;
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

export function AiSummariseButton({
  postId,
  initialSummary,
  postContent,
  isAuthenticated = false,
}: AiSummariseButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [summary, setSummary] = React.useState<string>(initialSummary || "");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSignInNudge, setShowSignInNudge] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleStartSummarising = async () => {
    if (!isAuthenticated) {
      setShowSignInNudge(true);
      return;
    }

    // If summary already exists and not currently streaming, just open it
    if (summary && !isStreaming) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    setError(null);
    setSummary("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const plainText = extractTextFromBlocks(postContent);

    if (!plainText.trim()) {
      setError("This story has no text content to summarise.");
      setIsStreaming(false);
      return;
    }

    let accumulated = "";

    try {
      await streamAiCompletion({
        feature: "summarise",
        postId,
        context: plainText.slice(0, 10000), // pass up to 10k chars of article
        signal: controller.signal,
        onToken: (token) => {
          accumulated += token;
          setSummary(accumulated);
        },
        onComplete: () => {
          setIsStreaming(false);
        },
        onError: (err, isLimit) => {
          setIsStreaming(false);
          setError(
            isLimit
              ? "You've reached your daily AI limit. Upgrade your plan."
              : err.message || "Failed to generate summary."
          );
        },
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to generate summary.");
      }
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartSummarising}
            className="rounded-full h-8 px-3.5 text-xs font-medium gap-1.5 border-border hover:bg-secondary transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>{summary ? "View AI summary" : "Summarise with AI"}</span>
          </Button>
        </div>
      )}

      {/* Guest Sign-In Nudge */}
      {showSignInNudge && !isAuthenticated && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-foreground text-background shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-foreground">Sign in to use AI summaries</p>
              <p className="text-muted-foreground mt-0.5">
                Members get instant AI-powered executive summaries of any story.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowSignInNudge(false)}
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Dismiss
            </button>
            <Link href={`/login?redirect=/posts/${postId}`}>
              <Button
                variant="primary"
                size="sm"
                className="rounded-full h-8 px-4 text-xs font-medium"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* AI Summary Card */}
      {isOpen && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in duration-150">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>AI Executive Summary</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isStreaming ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStop}
                  className="h-7 px-2.5 text-[11px] rounded-full gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </Button>
              ) : summary ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Copy summary"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Collapse summary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Loading state before first token */}
          {isStreaming && !summary && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
              <span>Synthesizing story premise with AI…</span>
            </div>
          )}

          {/* Smoothly streamed summary text */}
          {summary && (
            <AiSmoothStreamResponse
              text={summary}
              isStreaming={isStreaming}
              speed="natural"
              className="text-sm sm:text-base"
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="text-xs text-destructive flex items-center justify-between pt-1">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleStartSummarising}
                className="underline hover:no-underline text-[11px]"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
