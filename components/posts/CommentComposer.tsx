"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentComposerProps {
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  autoFocus?: boolean;
  isPending?: boolean;
  error?: string | null;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
}

export function CommentComposer({
  placeholder,
  submitLabel,
  initialValue = "",
  autoFocus = false,
  isPending = false,
  error = null,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [body, setBody] = React.useState(initialValue);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [autoFocus]);

  const trimmedLength = body.trim().length;
  const tooLong = trimmedLength > 2000;
  const canSubmit = trimmedLength > 0 && !tooLong && !isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await onSubmit(body.trim());
    if (ok) {
      setBody("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 font-sans">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2100}
        className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
      />

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-xs ${
            tooLong ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {trimmedLength > 1500 ? `${trimmedLength} / 2000` : ""}
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-full h-8 px-3 text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            className="rounded-full h-8 px-4 text-xs gap-1.5"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
