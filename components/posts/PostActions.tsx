"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostDetailQuery } from "@/hooks/queries/usePostDetail";
import {
  useToggleBookmarkPostMutation,
  useToggleLikePostMutation,
} from "@/hooks/mutations/usePostMutations";
import type { Post } from "@/types/post";

interface PostActionsProps {
  post: Post;
  currentUserId?: string;
}

export function PostActions({ post, currentUserId }: PostActionsProps) {
  const viewerId = currentUserId ?? "guest";
  const isAuthenticated = Boolean(currentUserId);
  const [showSignInNudge, setShowSignInNudge] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const { data: livePost } = usePostDetailQuery(post.id, viewerId, post);
  const likeMutation = useToggleLikePostMutation(post.id, viewerId);
  const bookmarkMutation = useToggleBookmarkPostMutation(post.id, viewerId);

  const current = livePost ?? post;
  const likedByMe = Boolean(current.likedByMe);
  const bookmarkedByMe = Boolean(current.bookmarkedByMe);

  const handleLike = () => {
    setActionError(null);
    if (!isAuthenticated) {
      setShowSignInNudge(true);
      return;
    }
    likeMutation.mutate(likedByMe, {
      onSuccess: (res) => {
        if (!res.success && res.error) {
          setActionError(res.error);
        }
      },
    });
  };

  const handleBookmark = () => {
    setActionError(null);
    if (!isAuthenticated) {
      setShowSignInNudge(true);
      return;
    }
    bookmarkMutation.mutate(bookmarkedByMe, {
      onSuccess: (res) => {
        if (!res.success && res.error) {
          setActionError(res.error);
        }
      },
    });
  };

  return (
    <div className="space-y-3 border-y border-border py-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            aria-pressed={likedByMe}
            aria-label={likedByMe ? "Unlike story" : "Like story"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Heart
              className={`w-[18px] h-[18px] stroke-[1.75] transition-colors ${
                likedByMe ? "text-red-500/85 fill-red-500/85" : ""
              }`}
            />
            <span className={likedByMe ? "text-foreground" : ""}>
              {current.likesCount}
            </span>
          </button>

          <a
            href="#comments"
            aria-label="Jump to comments"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-[18px] h-[18px] stroke-[1.75]" />
            <span>{current.commentsCount}</span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkMutation.isPending}
          aria-pressed={bookmarkedByMe}
          aria-label={bookmarkedByMe ? "Remove bookmark" : "Save story"}
          title={bookmarkedByMe ? "Remove bookmark" : "Save story"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Bookmark
            className={`w-[18px] h-[18px] stroke-[1.75] transition-colors ${
              bookmarkedByMe ? "text-foreground/80 fill-foreground/80" : ""
            }`}
          />
          <span className={bookmarkedByMe ? "text-foreground" : ""}>
            {current.bookmarksCount}
          </span>
        </button>
      </div>

      {showSignInNudge && !isAuthenticated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">
            Sign in to like, bookmark, or save stories for later.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSignInNudge(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Dismiss
            </button>
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/posts/${post.id}`)}`}>
              <Button size="sm" className="rounded-full h-7 px-3 text-xs">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      )}

      {actionError && (
        <p className="text-xs text-destructive" role="alert">
          {actionError}
        </p>
      )}
    </div>
  );
}
