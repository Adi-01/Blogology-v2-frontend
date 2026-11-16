"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Sparkles,
  Copy,
  Check,
  X,
  UserPlus,
  UserCheck,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSmoothStreamResponse } from "@/components/shared/AiSmoothStreamResponse";

export function PostDetailMockup() {
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(true);
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(42);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [bookmarksCount, setBookmarksCount] = React.useState(12);
  const [commentLiked, setCommentLiked] = React.useState(false);
  const [commentLikesCount, setCommentLikesCount] = React.useState(7);
  const [commentSort, setCommentSort] = React.useState<"top" | "newest">("top");

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const handleToggleBookmark = () => {
    if (bookmarked) {
      setBookmarked(false);
      setBookmarksCount((c) => c - 1);
    } else {
      setBookmarked(true);
      setBookmarksCount((c) => c + 1);
    }
  };

  const handleToggleCommentLike = () => {
    if (commentLiked) {
      setCommentLiked(false);
      setCommentLikesCount((c) => c - 1);
    } else {
      setCommentLiked(true);
      setCommentLikesCount((c) => c + 1);
    }
  };

  const handleCopySummary = () => {
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-border bg-card shadow-soft p-6 sm:p-10 md:p-14 transition-all duration-300">
      <article className="space-y-8 font-sans">
        {/* 1. Cover Image (Exact markup from posts/[id]) */}
        <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Designing Resilient Multi-Region Microservices Without Distributed Lock Bottlenecks"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. Title (Exact markup from posts/[id]) */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Designing Resilient Multi-Region Microservices Without Distributed Lock Bottlenecks
        </h1>

        {/* 3. Tags (Exact markup from posts/[id]) */}
        <div className="flex flex-wrap gap-2">
          {["architecture", "cloud", "performance", "systemdesign"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 4. Author Byline (Exact markup from posts/[id]) */}
        <div className="flex items-center justify-between border-y border-border py-4">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Liam Vance"
              className="w-11 h-11 rounded-full object-cover aspect-square shrink-0 border border-border"
            />
            <div>
              <div className="font-medium text-sm text-foreground">
                Liam Vance
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span>@liam_arch</span>
                <span>·</span>
                <span>Nov 14, 2026</span>
                <span>·</span>
                <span>5 min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Exact FollowButton from components/profile/FollowButton.tsx */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsFollowing((prev) => !prev)}
              aria-label={isFollowing ? "Following Liam Vance" : "Follow Liam Vance"}
              className="rounded-full transition-colors font-sans font-medium select-none text-xs h-7 px-3 cursor-pointer"
            >
              {isFollowing ? (
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Following
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Follow
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 5. AI Executive Summary Feature (Exact markup from components/posts/AiSummariseButton.tsx) */}
        <div className="w-full space-y-3 font-sans">
          {!isSummaryOpen && (
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSummaryOpen(true)}
                className="rounded-full h-8 px-3.5 text-xs font-medium gap-1.5 border-border hover:bg-secondary transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-foreground" />
                <span>View AI summary</span>
              </Button>
            </div>
          )}

          {isSummaryOpen && (
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in duration-150">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground tracking-tight">
                  <Sparkles className="w-3.5 h-3.5 text-foreground" />
                  <span>AI Executive Summary</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Copy summary"
                  >
                    {copiedSummary ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSummaryOpen(false)}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Collapse summary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <AiSmoothStreamResponse
                text="When scaling microservices across geographical continents, synchronous locks mathematically choke throughput. By adopting Conflict-Free Replicated Data Types (CRDTs) alongside transactional outboxes, edge clusters achieve autonomous local writes under 10ms with guaranteed eventual convergence."
                speed="natural"
                className="text-sm sm:text-base font-serif text-foreground/90 leading-relaxed"
                showCursor={false}
              />
            </div>
          )}
        </div>

        {/* 6. Post Content (Article Body) */}
        <div className="pt-2 font-serif text-[18px] md:text-[19px] leading-[1.7] max-w-reading text-foreground space-y-6">
          <p>
            When scaling stateful microservices across geographical regions, distributed lock managers like ZooKeeper or Redis Redlock quickly emerge as catastrophic throughput bottlenecks. Network latency across continents makes synchronous consensus mathematically impossible to sustain under high concurrent traffic.
          </p>

          <h2 className="font-display font-semibold text-[22px] md:text-[26px] mt-12 mb-4 tracking-tight text-foreground">
            The Latency Tax of Distributed Synchronization
          </h2>

          <p>
            Under standard distributed locking protocols, a single write transaction must synchronize state across multiple availability zones. If the network experiences transit jitter between North America and Europe, every dependent HTTP thread stalls. In contrast, embracing asynchronous event logs allows edge regions to acknowledge customer writes locally before streaming mutations to sibling clusters.
          </p>

          <blockquote className="font-display italic text-2xl border-l-[3px] border-foreground pl-6 my-10 text-foreground">
            “Consensus isn’t free—measure throughput before synchronizing state across continents.”
          </blockquote>

          <h3 className="font-display font-semibold text-xl mt-8 mb-3 tracking-tight text-foreground">
            Core Architectural Tenets
          </h3>

          <ul className="space-y-3 font-sans text-sm sm:text-base text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Conflict-Free Replicated Data Types (CRDTs):</strong> Automatically resolve concurrent state divergences without requiring coordinator locks.
            </li>
            <li>
              <strong className="text-foreground">Idempotency Keys &amp; Transactional Outboxes:</strong> Guarantee at-least-once message delivery without state duplication.
            </li>
          </ul>

          <p>
            By shifting from synchronous locks to asynchronous state reconciliation, teams achieve genuine fault isolation. When one region experiences degradation, remaining zones continue serving customer requests with zero downtime.
          </p>
        </div>

        {/* 7. Post Actions Bar (Exact markup from components/posts/PostActions.tsx) */}
        <div className="space-y-3 border-y border-border py-3.5 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={handleToggleLike}
                aria-pressed={liked}
                aria-label={liked ? "Unlike story" : "Like story"}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-[18px] h-[18px] stroke-[1.75] transition-colors ${
                    liked ? "text-red-500/85 fill-red-500/85" : ""
                  }`}
                />
                <span className={liked ? "text-foreground" : ""}>
                  {likesCount}
                </span>
              </button>

              <a
                href="#comments"
                aria-label="Jump to comments"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-[18px] h-[18px] stroke-[1.75]" />
                <span>18</span>
              </a>
            </div>

            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Remove bookmark" : "Save story"}
              title={bookmarked ? "Remove bookmark" : "Save story"}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-[18px] h-[18px] stroke-[1.75] transition-colors ${
                  bookmarked ? "text-foreground/80 fill-foreground/80" : ""
                }`}
              />
              <span className={bookmarked ? "text-foreground" : ""}>
                {bookmarksCount}
              </span>
            </button>
          </div>
        </div>
      </article>

      {/* 8. Comments Section (Exact markup from components/posts/CommentsSection.tsx - NO outer border!) */}
      <section id="comments" className="pt-10 space-y-6 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 stroke-[1.75]" />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Comments (18)
            </h2>
          </div>

          <div className="inline-flex items-center rounded-full border border-border bg-secondary/40 p-0.5 text-xs">
            {(["top", "newest"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCommentSort(option)}
                className={`rounded-full px-3.5 py-1 font-medium capitalize transition-colors cursor-pointer ${
                  commentSort === option
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Sign In Banner (Exact markup from CommentsSection.tsx) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3.5 text-sm">
          <span className="text-muted-foreground">
            Sign in to join the conversation, reply, or like comments.
          </span>
          <Link href="/login">
            <Button size="sm" className="rounded-full h-8 px-4 text-xs">
              Sign in
            </Button>
          </Link>
        </div>

        {/* Comment Item (Exact markup from components/posts/CommentItemCard.tsx) */}
        <div className="space-y-6 pt-2">
          <div className="space-y-3 font-sans">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=150"
                alt="Priya Sharma"
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                  <span className="font-medium text-foreground">
                    Priya Sharma
                  </span>
                  <span className="text-muted-foreground">
                    @priya_devops
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-muted-foreground">
                    2 hours ago
                  </span>
                </div>

                <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap break-words">
                  This asynchronous reconciliation pattern saved our pipeline during the Black Friday peak. We saw p99 latency drop from 180ms down to 12ms once we removed cross-datacenter locking.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={handleToggleCommentLike}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 stroke-[1.75] transition-colors ${
                        commentLiked ? "text-foreground/75 fill-foreground/75" : ""
                      }`}
                    />
                    <span className={commentLiked ? "text-foreground" : ""}>
                      {commentLikesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="hover:text-foreground transition-colors cursor-pointer font-medium"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
