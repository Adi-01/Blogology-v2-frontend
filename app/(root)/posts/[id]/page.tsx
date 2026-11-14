import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postService } from "@/lib/services/post.services";
import { userService } from "@/lib/services/user.services";
import { PostContent } from "@/components/posts/PostContent";
import { ViewIncrement } from "@/components/posts/ViewIncrement";
import { PostBackButton } from "@/components/posts/PostBackButton";
import { AiSummariseButton } from "@/components/posts/AiSummariseButton";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await postService.getPostById(id);

  if (!post) {
    return {
      title: "Story Not Found — Blogology",
    };
  }

  return {
    title: `${post.title} — Blogology`,
    description: post.summary || `Story by ${post.author.name} on Blogology.`,
    authors: [{ name: post.author.name }],
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const [post, currentUser] = await Promise.all([
    postService.getPostById(id),
    userService.getCurrentUser(),
  ]);

  if (!post) {
    notFound();
  }

  const isAuthor = currentUser?.id === post.authorId;
  const fallbackHref = isAuthor
    ? "/dashboard"
    : currentUser
      ? "/for-you-page"
      : "/";
  const publishedDate = new Date(
    post.publishedAt || post.createdAt,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {!isAuthor && <ViewIncrement postId={post.id} />}

      {/* Main Article Canvas */}
      <main className="flex-1 max-w-4xl lg:max-w-5xl mx-auto w-full px-6 sm:px-10 md:px-14 py-8 md:py-12">
        {/* Top Navigation & Actions */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <PostBackButton fallbackHref={fallbackHref} label="Go back" />

          {isAuthor && (
            <Link href={`/write/${post.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-8 px-3.5 text-xs font-medium gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit story</span>
              </Button>
            </Link>
          )}
        </div>

        <article className="space-y-8">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Byline */}
          <div className="flex items-center justify-between border-y border-border py-4">
            <Link
              href={`/users/${post.author.username}`}
              className="flex items-center gap-3.5 hover:opacity-85 transition-opacity"
            >
              {post.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover aspect-square shrink-0 border border-border"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm text-foreground uppercase border border-border aspect-square shrink-0">
                  {post.author.name.charAt(0)}
                </div>
              )}

              <div>
                <div className="font-medium text-sm text-foreground hover:underline">
                  {post.author.name}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>@{post.author.username}</span>
                  <span>·</span>
                  <span>{publishedDate}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </Link>

            {post.status === "DRAFT" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                Author Preview (Draft)
              </span>
            )}
          </div>

          {/* AI Executive Summary Feature */}
          <AiSummariseButton
            postId={post.id}
            initialSummary={post.summary}
            postContent={post.content}
            isAuthenticated={!!currentUser}
          />

          {/* Content */}
          <div className="pt-2">
            <PostContent content={post.content} />
          </div>

          {post.status === "PUBLISHED" && (
            <PostActions post={post} currentUserId={currentUser?.id} />
          )}
        </article>

        {post.status === "PUBLISHED" && (
          <div>
            <CommentsSection
              postId={post.id}
              initialCommentsCount={post.commentsCount}
              currentUserId={currentUser?.id}
            />
          </div>
        )}
      </main>
    </div>
  );
}
