"use client";

import * as React from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  Bookmark,
  MessageCircle,
  Edit3,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeletePostMutation } from "@/hooks/mutations/usePostMutations";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const deletePostMutation = useDeletePostMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isPublished = post.status === "PUBLISHED";
  const targetHref = isPublished ? `/posts/${post.id}` : `/write/${post.id}`;

  const dateLabel = isPublished
    ? `Published ${new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : `Draft · updated ${new Date(post.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePostMutation.mutateAsync(post.id);
      if (res.success) {
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors">
        <div className="space-y-2.5 flex-1 min-w-0">
          {/* Status Badge + Date + Reading Time */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
                isPublished
                  ? "bg-success/15 text-success"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>

            <span className="text-muted-foreground/30">•</span>

            <span className="text-muted-foreground">{dateLabel}</span>

            <span className="text-muted-foreground/30">•</span>

            <span className="text-muted-foreground">
              {Math.max(1, post.readingTime || 1)} min read
            </span>
          </div>

          {/* Title */}
          <div>
            <Link
              href={targetHref}
              className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight hover:underline line-clamp-2 leading-snug"
            >
              {post.title}
            </Link>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Per-Post Metrics */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 select-none">
            <span className="flex items-center gap-1.5" title="Total Views">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewCount.toLocaleString()}</span>
            </span>

            <span className="flex items-center gap-1.5" title="Likes">
              <Heart className="w-3.5 h-3.5" />
              <span>{post.likesCount.toLocaleString()}</span>
            </span>

            <span className="flex items-center gap-1.5" title="Bookmarks">
              <Bookmark className="w-3.5 h-3.5" />
              <span>{post.bookmarksCount.toLocaleString()}</span>
            </span>

            <span className="flex items-center gap-1.5" title="Comments">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.commentsCount.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: View, Edit, and Delete */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {isPublished && (
            <Link
              href={`/posts/${post.id}`}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="View public story"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <Link href={`/write/${post.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
              <Edit3 className="w-3.5 h-3.5" />
             
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive-subtle/50 transition-colors cursor-pointer"
            title="Delete story"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete &ldquo;{post.title}&rdquo;? It will be removed from your dashboard and will no longer be accessible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deleting…
                </>
              ) : (
                "Delete Story"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
