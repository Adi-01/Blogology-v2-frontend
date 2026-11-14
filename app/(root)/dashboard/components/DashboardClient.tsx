"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PenLine, Eye, Heart, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import {
  useMyPostsQuery,
  useMyPostsSummaryQuery,
} from "@/hooks/queries/usePosts";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";
import type { PostStatus } from "@/types/post";

export function DashboardClient() {
  const searchParams = useSearchParams();

  const initialStatus =
    searchParams.get("status") === "PUBLISHED" ||
    searchParams.get("status") === "DRAFT"
      ? (searchParams.get("status") as PostStatus)
      : undefined;
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [statusFilter, setStatusFilter] = React.useState<PostStatus | undefined>(
    initialStatus
  );
  const [currentPage, setCurrentPage] = React.useState<number>(initialPage);

  const syncUrl = React.useCallback(
    (nextStatus: PostStatus | undefined, nextPage: number) => {
      const params = new URLSearchParams();
      if (nextStatus) params.set("status", nextStatus);
      if (nextPage > 1) params.set("page", String(nextPage));
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `/dashboard?${qs}` : "/dashboard"
      );
    },
    []
  );

  const activeQuery = useMyPostsQuery(currentPage, statusFilter);
  const summaryQuery = useMyPostsSummaryQuery(Boolean(statusFilter));

  const activePostsData = activeQuery.data;
  const allPostsData = statusFilter ? summaryQuery.data : activePostsData;

  const posts = activePostsData?.items ?? [];
  const pagination = activePostsData?.pagination;

  const totalViews = activePostsData?.stats?.totalViews ?? 0;
  const totalLikes = activePostsData?.stats?.totalLikes ?? 0;

  const allCount = allPostsData?.pagination?.total ?? 0;
  const publishedCount = (allPostsData?.items ?? []).filter(
    (p) => p.status === "PUBLISHED"
  ).length;
  const draftCount = (allPostsData?.items ?? []).filter(
    (p) => p.status === "DRAFT"
  ).length;

  const handleStatusChange = (nextStatus: PostStatus | undefined) => {
    setStatusFilter(nextStatus);
    setCurrentPage(1);
    syncUrl(nextStatus, 1);
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    syncUrl(statusFilter, nextPage);
  };

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            My Stories
          </h1>
          <p className="mt-1 font-serif text-sm text-muted-foreground">
            Manage your publication portfolio, drafts, and reader engagement metrics.
          </p>
        </div>

        <div>
          <Link href="/write">
            <Button
              variant="primary"
              size="sm"
              className="rounded-full gap-2 text-xs h-9 px-4 font-medium"
            >
              <PenLine className="w-4 h-4" />
              <span>Write story</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Aggregate Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border p-5 bg-card/50 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Views
            </span>
            <div className="p-2 rounded-xl bg-secondary">
              <Eye className="w-4 h-4 text-foreground" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across all published stories
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5 bg-card/50 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Likes
            </span>
            <div className="p-2 rounded-xl bg-secondary">
              <Heart className="w-4 h-4 text-foreground" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              {totalLikes.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Reader appreciation received
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5 bg-card/50 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Stories
            </span>
            <div className="p-2 rounded-xl bg-secondary">
              <BookOpen className="w-4 h-4 text-foreground" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              {allCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {publishedCount} published · {draftCount} drafts
            </p>
          </div>
        </div>
      </section>

      {/* Tabs / Filter Nav */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => handleStatusChange(undefined)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            !statusFilter
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          All Stories ({allCount})
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("PUBLISHED")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === "PUBLISHED"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("DRAFT")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === "DRAFT"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Post List */}
      <section>
        {activeQuery.isPending ? (
          <div className="divide-y divide-border/70">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="py-6 space-y-3">
                <div className="h-4 w-48 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-6 w-2/3 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-4 w-40 rounded-md bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : activeQuery.isError ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-4 my-4">
            <div className="p-3 rounded-full bg-secondary">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Unable to load your stories
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm">
                {activeQuery.error instanceof Error
                  ? activeQuery.error.message
                  : "Something went wrong while fetching your dashboard."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => activeQuery.refetch()}
              className="rounded-full text-xs px-4"
            >
              Try again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-4 my-4">
            <div className="p-3 rounded-full bg-secondary">
              <PenLine className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} stories found`
                  : "You haven't written any stories yet"}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm">
                {statusFilter
                  ? `You don't have any stories with status "${statusFilter.toLowerCase()}".`
                  : "Write your first post to start sharing your ideas with readers across Blogology."}
              </p>
            </div>
            <Link href="/write">
              <Button
                variant="primary"
                size="sm"
                className="rounded-full text-xs px-4"
              >
                Write your first post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {pagination.totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
