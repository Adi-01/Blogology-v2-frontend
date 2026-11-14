"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/components/posts/CommentComposer";
import { CommentItemCard } from "@/components/posts/CommentItemCard";
import { useCommentsQuery } from "@/hooks/queries/useComments";
import { useCreateCommentMutation } from "@/hooks/mutations/useCommentMutations";
import type { CommentSort } from "@/types/comment";

interface CommentsSectionProps {
  postId: string;
  initialCommentsCount: number;
  currentUserId?: string;
}

export function CommentsSection({
  postId,
  initialCommentsCount,
  currentUserId,
}: CommentsSectionProps) {
  const viewerId = currentUserId ?? "guest";
  const [sort, setSort] = React.useState<CommentSort>("top");
  const [showSignInNudge, setShowSignInNudge] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const commentsQuery = useCommentsQuery(postId, sort, viewerId);
  const createMutation = useCreateCommentMutation(postId, viewerId);

  const items = React.useMemo(() => {
    const all = commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [commentsQuery.data]);

  const totalCommentsCount =
    commentsQuery.data?.pages[0]?.totalCommentsCount ?? initialCommentsCount;

  const handleCreateRootComment = async (body: string) => {
    setCreateError(null);
    const res = await createMutation.mutateAsync({ body });
    if (!res.success) {
      setCreateError(res.error || "Failed to post comment.");
      return false;
    }
    return true;
  };

  return (
    <section id="comments" className="pt-10 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 stroke-[1.75]" />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Comments ({totalCommentsCount})
          </h2>
        </div>

        <div className="inline-flex items-center rounded-full border border-border bg-secondary/40 p-0.5 text-xs">
          {(["top", "newest"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              className={`rounded-full px-3.5 py-1 font-medium capitalize transition-colors cursor-pointer ${
                sort === option
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {currentUserId ? (
        <CommentComposer
          placeholder="Share your thoughts on this story..."
          submitLabel="Comment"
          isPending={createMutation.isPending}
          error={createError}
          onSubmit={handleCreateRootComment}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3.5 text-sm">
          <span className="text-muted-foreground">
            Sign in to join the conversation, reply, or like comments.
          </span>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/posts/${postId}`)}`}>
            <Button size="sm" className="rounded-full h-8 px-4 text-xs">
              Sign in
            </Button>
          </Link>
        </div>
      )}

      {showSignInNudge && !currentUserId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">
            Please sign in to like or reply to comments.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSignInNudge(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Dismiss
            </button>
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/posts/${postId}`)}`}>
              <Button size="sm" className="rounded-full h-7 px-3 text-xs">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      )}

      {commentsQuery.isPending ? (
        <div className="space-y-4 py-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-4 w-5/6 rounded-md bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : commentsQuery.isError ? (
        <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground flex items-center justify-between">
          <span>Unable to load comments right now.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => commentsQuery.refetch()}
            className="rounded-full h-8 px-3 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground text-center">
          No comments yet. Start the discussion above.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((comment) => (
            <CommentItemCard
              key={comment.id}
              comment={comment}
              postId={postId}
              viewerId={viewerId}
              currentUserId={currentUserId}
              onGuestAction={() => setShowSignInNudge(true)}
            />
          ))}

          {commentsQuery.hasNextPage && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => commentsQuery.fetchNextPage()}
                disabled={commentsQuery.isFetchingNextPage}
                className="rounded-full h-9 px-5 text-xs gap-2"
              >
                {commentsQuery.isFetchingNextPage && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Load more comments
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
