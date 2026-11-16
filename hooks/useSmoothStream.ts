"use client";

import * as React from "react";

export interface UseSmoothStreamOptions {
  speed?: "natural" | "fast" | "relaxed";
  onComplete?: () => void;
}

export function useSmoothStream(
  targetText: string,
  isStreaming: boolean = false,
  options: UseSmoothStreamOptions = {}
): { displayedText: string; isAnimating: boolean } {
  const { speed = "natural", onComplete } = options;

  const [displayedText, setDisplayedText] = React.useState("");
  const [isAnimating, setIsAnimating] = React.useState(false);

  const displayedLengthRef = React.useRef(0);
  const targetTextRef = React.useRef(targetText);
  const isStreamingRef = React.useRef(isStreaming);
  const animFrameRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number>(0);
  const onCompleteRef = React.useRef(onComplete);

  targetTextRef.current = targetText;
  isStreamingRef.current = isStreaming;
  onCompleteRef.current = onComplete;

  // Handle immediate text reset
  React.useEffect(() => {
    if (!targetText) {
      displayedLengthRef.current = 0;
      setDisplayedText("");
      setIsAnimating(false);
    }
  }, [targetText]);

  // Main animation frame loop
  React.useEffect(() => {
    const baseInterval =
      speed === "fast" ? 10 : speed === "relaxed" ? 26 : 16;

    const tick = (now: number) => {
      const target = targetTextRef.current;
      const targetLen = target.length;
      let currentLen = displayedLengthRef.current;

      if (currentLen < targetLen) {
        setIsAnimating(true);
        const elapsed = now - lastTimeRef.current;

        if (elapsed >= baseInterval) {
          lastTimeRef.current = now;

          const distance = targetLen - currentLen;
          let step = 1;
          if (distance > 150) {
            step = Math.ceil(distance / 12);
          } else if (distance > 60) {
            step = Math.ceil(distance / 20);
          } else if (distance > 20) {
            step = 2;
          } else {
            step = 1;
          }

          currentLen = Math.min(targetLen, currentLen + step);
          displayedLengthRef.current = currentLen;
          setDisplayedText(target.slice(0, currentLen));
        }

        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        if (!isStreamingRef.current) {
          setIsAnimating(false);
          onCompleteRef.current?.();
        } else {
          // Stream is ongoing, wait for next token batch
          animFrameRef.current = requestAnimationFrame(tick);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [speed]);

  return { displayedText, isAnimating };
}
