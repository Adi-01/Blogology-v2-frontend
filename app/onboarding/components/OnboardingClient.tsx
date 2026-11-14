"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveInterestsAction } from "@/app/actions/user";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { TagItem } from "@/types/user";
import type { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

interface OnboardingClientProps {
  tags: TagItem[];
  userName: string;
}

export function OnboardingClient({ tags, userName }: OnboardingClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const destination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/for-you-page";

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const remaining = Math.max(0, 3 - selectedTagIds.length);
  const canContinue = selectedTagIds.length >= 3;

  const handleContinue = async () => {
    if (selectedTagIds.length < 3) {
      setErrorMessage("Please select at least 3 topics to continue.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await saveInterestsAction(selectedTagIds);
      if (!res.success) {
        setErrorMessage(res.message || "Failed to save topics.");
        setIsSubmitting(false);
      } else {
        queryClient.setQueryData<AuthUser | null>(QUERY_KEYS.me(), (old) =>
          old ? { ...old, hasOnboarded: true } : old,
        );
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
        router.refresh();
        router.replace(destination);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 font-sans bg-background text-foreground">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Welcome, {userName}.
          </h1>
          <p className="font-serif text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Choose at least 3 topics you care about to personalize your reading
            feed.
          </p>
        </div>

        {/* Tag Selection Grid */}
        <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Pick your interests (minimum 3)
            </span>
            <span
              className={cn(
                canContinue
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {selectedTagIds.length} selected{" "}
              {remaining > 0 ? `(${remaining} more required)` : "✓"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all select-none cursor-pointer border",
                    isSelected
                      ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                      : "bg-secondary text-secondary-foreground border-border hover:border-foreground/30",
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          {/* Action Button */}
          <div className="pt-2 border-t border-border flex items-center justify-end">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleContinue}
              disabled={isSubmitting || !canContinue}
              className="rounded-full text-xs font-medium h-10 px-6 w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              {canContinue
                ? "Continue to Feed"
                : `Select at least ${remaining} more topic${remaining > 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
