"use client";

import * as React from "react";
import { useSmoothStream, type UseSmoothStreamOptions } from "@/hooks/useSmoothStream";
import { cn } from "@/lib/utils";

export interface AiSmoothStreamResponseProps extends UseSmoothStreamOptions {
  text: string;
  isStreaming?: boolean;
  className?: string;
  showCursor?: boolean;
  as?: "p" | "div" | "span";
}

export function AiSmoothStreamResponse({
  text,
  isStreaming = false,
  speed = "natural",
  className,
  showCursor = true,
  as: Component = "p",
  onComplete,
}: AiSmoothStreamResponseProps) {
  const { displayedText, isAnimating } = useSmoothStream(text, isStreaming, {
    speed,
    onComplete,
  });

  const shouldShowCursor = showCursor && (isStreaming || isAnimating);

  return (
    <Component
      className={cn(
        "font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap",
        className
      )}
    >
      <span>{displayedText}</span>
      {shouldShowCursor && (
        <span
          className="inline-block w-1.5 h-4 ml-1 bg-foreground animate-pulse align-middle"
          aria-hidden="true"
        />
      )}
    </Component>
  );
}
