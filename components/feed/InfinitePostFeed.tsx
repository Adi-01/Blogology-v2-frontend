"use client";

import * as React from "react";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostFeedCard } from "@/components/feed/PostFeedCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CursorFeedResponse } from "@/types/post";

interface InfinitePostFeedProps {
  query: UseInfiniteQueryResult<InfiniteData<CursorFeedResponse>, Error>;
  enabled?: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  endMessage?: string;
}

export function FeedSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/70">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="flex flex-col sm:flex-row items-start justify-between gap-6 py-7"
        >
          <div className="flex-1 min-w-0 space-y-3 w-full">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-muted/50 animate-pulse shrink-0" />
              <div className="h-3.5 w-28 rounded-full bg-muted/50 animate-pulse" />
              <div className="h-3.5 w-20 rounded-full bg-muted/40 animate-pulse" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-6 w-11/12 rounded-md bg-muted/50 animate-pulse" />
              <div className="h-6 w-3/4 rounded-md bg-muted/50 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-md bg-muted/40 animate-pulse" />
              <div className="h-4 w-5/6 rounded-md bg-muted/40 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="h-5 w-16 rounded-full bg-muted/40 animate-pulse" />
              <div className="h-5 w-14 rounded-full bg-muted/40 animate-pulse" />
              <div className="h-3.5 w-10 rounded-full bg-muted/40 animate-pulse ml-auto" />
            </div>
          </div>

          <div className="w-full sm:w-44 aspect-[16/10] sm:aspect-square rounded-2xl bg-muted/50 animate-pulse shrink-0" />
        </article>
      ))}
    </div>
  );
}

export function InfinitePostFeed({
  query,
  enabled = true,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  endMessage = "You've reached the end of this feed.",
}: InfinitePostFeedProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = query;

  const items = React.useMemo(() => {
    const all = data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, enabled, fetchNextPage]);

  if (isPending && enabled) {
    return <FeedSkeletonList count={4} />;
  }

  if (isError && items.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-6 h-6 stroke-[1.5]" />}
        title="Unable to load stories"
        description={
          error instanceof Error
            ? error.message
            : "Something went wrong while fetching stories."
        }
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-full px-5 h-10"
          >
            Try again
          </Button>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="divide-y divide-border">
        {items.map((post) => (
          <PostFeedCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={sentinelRef} className="pt-4 pb-8 flex flex-col items-center gap-3">
        {isError && (
          <p className="text-xs text-destructive font-sans">
            {error instanceof Error
              ? error.message
              : "Unable to load additional stories."}
          </p>
        )}

        {hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="rounded-full px-6 h-10 text-xs font-medium gap-2"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>
              {isFetchingNextPage ? "Loading stories…" : "Load more stories"}
            </span>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground font-sans">{endMessage}</p>
        )}
      </div>
    </div>
  );
}
