import * as React from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, UserCheck } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedPostItem } from "@/types/post";

interface PostFeedCardProps {
  post: FeedPostItem;
  hideAuthor?: boolean;
}

export function PostFeedCard({ post, hideAuthor = false }: PostFeedCardProps) {
  const publishedDate = post.publishedAt || post.createdAt;
  const postHref = `/posts/${post.id}`;

  return (
    <article className="group py-7 first:pt-2 transition-colors">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Byline */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-sans">
            {!hideAuthor && (
              <>
                <Link
                  href={`/users/${post.author.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {post.author.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[11px] font-medium text-foreground uppercase border border-border shrink-0">
                      {post.author.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-foreground">
                    {post.author.name}
                  </span>
                </Link>

                {post.isFollowedAuthor && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    Following
                  </span>
                )}

                <span className="text-muted-foreground/40">·</span>
              </>
            )}

            <span className="text-muted-foreground">
              {formatRelativeTime(publishedDate)}
            </span>

            <span className="text-muted-foreground/40">·</span>

            <span className="text-muted-foreground">
              {Math.max(1, post.readingTime || 1)} min read
            </span>
          </div>

          {/* Headline & Excerpt */}
          <Link href={postHref} className="block space-y-1.5 group/title">
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground group-hover/title:underline leading-snug line-clamp-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="font-serif text-base text-muted-foreground leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* Tags & Engagement Footer */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1" title="Likes">
                <Heart className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{post.likesCount}</span>
              </span>
              <span className="inline-flex items-center gap-1" title="Comments">
                <MessageCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{post.commentsCount}</span>
              </span>
              <span className="inline-flex items-center gap-1" title="Bookmarks">
                <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{post.bookmarksCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Cover Image Thumbnail */}
        {post.coverImage && (
          <Link
            href={postHref}
            className="w-full sm:w-40 md:w-44 h-44 sm:h-28 rounded-xl overflow-hidden border border-border shrink-0 bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
