"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PostStatus } from "@/types/post";

interface EditorToolbarProps {
  postId: string | null;
  status: PostStatus;
  canPublish?: boolean;
  missingRequirements?: string[];
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  onDelete: () => Promise<void>;
  isPublishing?: boolean;
  isUnpublishing?: boolean;
  isDeleting?: boolean;
}

export function EditorToolbar({
  postId,
  status,
  canPublish = true,
  missingRequirements = [],
  onPublish,
  onUnpublish,
  onDelete,
  isPublishing = false,
  isUnpublishing = false,
  isDeleting = false,
}: EditorToolbarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = React.useState(false);

  const handleDeleteConfirm = async () => {
    await onDelete();
    setDeleteDialogOpen(false);
  };

  const handlePublishConfirm = async () => {
    setPublishDialogOpen(false);
    await onPublish();
  };

  const handleUnpublishConfirm = async () => {
    setUnpublishDialogOpen(false);
    await onUnpublish();
  };

  return (
    <>
      {/* Floating Action Tab Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-full px-3.5 py-2 flex items-center gap-2 text-xs">
        {/* View Public Story (if published) */}
        {status === "PUBLISHED" && postId && (
          <Link
            href={`/posts/${postId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="View public story"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}

        {/* Delete Trigger Button */}
        {postId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete post"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* Primary Action Button: Publish or Unpublish */}
        {status === "PUBLISHED" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUnpublishDialogOpen(true)}
            disabled={isUnpublishing || isPublishing || isDeleting || !postId}
            className="h-8 px-4 rounded-full text-xs font-medium transition-colors"
          >
            {isUnpublishing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                Unpublishing…
              </>
            ) : (
              "Unpublish"
            )}
          </Button>
        ) : (
          <div
            title={
              !canPublish && missingRequirements.length > 0
                ? `Requirements to publish:\n• ${missingRequirements.join("\n• ")}`
                : undefined
            }
          >
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setPublishDialogOpen(true)}
              disabled={!canPublish || isPublishing || isUnpublishing || isDeleting}
              className="h-8 px-4 rounded-full text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                  Publishing…
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete this story? It will be removed from your
              dashboard and will no longer be accessible to anyone.
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

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Story</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you ready to share your story with the world? Once published, your post will be publicly discoverable on Blogology.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPublishDialogOpen(false)}
              disabled={isPublishing}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublishConfirm}
              disabled={isPublishing}
              className="rounded-full"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Publishing…
                </>
              ) : (
                "Publish Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish Confirmation Dialog */}
      <Dialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unpublish Story</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to unpublish this story? It will revert back to a draft and will no longer be visible to readers or appear in public feeds.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUnpublishDialogOpen(false)}
              disabled={isUnpublishing}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUnpublishConfirm}
              disabled={isUnpublishing}
              className="rounded-full border-border hover:bg-secondary"
            >
              {isUnpublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Unpublishing…
                </>
              ) : (
                "Unpublish Story"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
