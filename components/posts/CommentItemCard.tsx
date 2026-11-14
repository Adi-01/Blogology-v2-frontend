"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { CommentComposer } from "@/components/posts/CommentComposer";
import { useCommentRepliesQuery } from "@/hooks/queries/useComments";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
  useUpdateCommentMutation,
} from "@/hooks/mutations/useCommentMutations";
import type { CommentItem } from "@/types/comment";

interface CommentItemCardProps {
  comment: CommentItem;
  postId: string;
  viewerId: string;
  currentUserId?: string;
  isReply?: boolean;
  onGuestAction: () => void;
  onReplyToReply?: (mentionPrefix: string) => void;
}

export function CommentItemCard({
  comment,
  postId,
  viewerId,
  currentUserId,
  isReply = false,
  onGuestAction,
  onReplyToReply,
}: CommentItemCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyPrefix, setReplyPrefix] = React.useState("");
  const [repliesExpanded, setRepliesExpanded] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isOwner = Boolean(currentUserId && comment.author?.id === currentUserId);

  const createReplyMutation = useCreateCommentMutation(postId, viewerId);
  const updateMutation = useUpdateCommentMutation(
    postId,
    viewerId,
    comment.parentId
  );
  const deleteMutation = useDeleteCommentMutation(
    postId,
    viewerId,
    comment.parentId
  );
  const likeMutation = useToggleCommentLikeMutation(
    postId,
    viewerId,
    comment.parentId
  );

  const repliesQuery = useCommentRepliesQuery(
    comment.id,
    viewerId,
    !isReply && repliesExpanded
  );

  const replies = React.useMemo(() => {
    const all = repliesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [repliesQuery.data]);

  const handleToggleLike = () => {
    setErrorMessage(null);
    if (!currentUserId) {
      onGuestAction();
      return;
    }
    likeMutation.mutate(
      { commentId: comment.id, currentlyLiked: comment.likedByMe },
      {
        onSuccess: (res) => {
          if (!res.success && res.error) setErrorMessage(res.error);
        },
      }
    );
  };

  const handleOpenReply = () => {
    setErrorMessage(null);
    if (!currentUserId) {
      onGuestAction();
      return;
    }

    if (isReply && onReplyToReply) {
      const mention = comment.author?.username
        ? `@${comment.author.username} `
        : "";
      onReplyToReply(mention);
      return;
    }

    setReplyPrefix("");
    setReplyOpen((prev) => !prev);
  };

  const handleUpdate = async (body: string) => {
    setErrorMessage(null);
    const res = await updateMutation.mutateAsync({
      commentId: comment.id,
      dto: { body },
    });
    if (!res.success) {
      setErrorMessage(res.error || "Failed to update comment.");
      return false;
    }
    setIsEditing(false);
    return true;
  };

  const handleCreateReply = async (body: string) => {
    setErrorMessage(null);
    const res = await createReplyMutation.mutateAsync({
      body,
      parentId: comment.id,
    });
    if (!res.success) {
      setErrorMessage(res.error || "Failed to post reply.");
      return false;
    }
    setReplyOpen(false);
    setReplyPrefix("");
    setRepliesExpanded(true);
    return true;
  };

  const handleConfirmDelete = async () => {
    setErrorMessage(null);
    const res = await deleteMutation.mutateAsync(comment.id);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to delete comment.");
    }
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-3 font-sans">
      {comment.isDeleted ? (
        <div className="rounded-xl border border-border/70 bg-secondary/30 px-4 py-2.5 text-xs italic text-muted-foreground">
          This comment was deleted.
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {comment.author?.username ? (
            <Link
              href={`/users/${comment.author.username}`}
              className="hover:opacity-80 transition-opacity shrink-0 mt-0.5"
            >
              {comment.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground uppercase border border-border">
                  {comment.author.name?.charAt(0) ?? "?"}
                </div>
              )}
            </Link>
          ) : comment.author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground uppercase border border-border shrink-0 mt-0.5">
              {comment.author?.name?.charAt(0) ?? "?"}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              {comment.author?.username ? (
                <Link
                  href={`/users/${comment.author.username}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <span className="font-medium text-foreground">
                    {comment.author.name}
                  </span>
                  <span className="text-muted-foreground">
                    @{comment.author.username}
                  </span>
                </Link>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {comment.author?.name}
                  </span>
                  {comment.author?.username && (
                    <span className="text-muted-foreground">
                      @{comment.author.username}
                    </span>
                  )}
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-muted-foreground">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <CommentComposer
                placeholder="Edit your comment..."
                submitLabel="Save"
                initialValue={comment.body ?? ""}
                autoFocus
                isPending={updateMutation.isPending}
                error={errorMessage}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setIsEditing(false);
                  setErrorMessage(null);
                }}
              />
            ) : (
              <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap break-words">
                {comment.body}
              </p>
            )}

            {!isEditing && (
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={likeMutation.isPending}
                  aria-pressed={comment.likedByMe}
                  aria-label={comment.likedByMe ? "Unlike comment" : "Like comment"}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 stroke-[1.75] transition-colors ${
                      comment.likedByMe ? "text-foreground/75 fill-foreground/75" : ""
                    }`}
                  />
                  <span className={comment.likedByMe ? "text-foreground" : ""}>
                    {comment.likesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenReply}
                  className="hover:text-foreground transition-colors cursor-pointer font-medium"
                >
                  Reply
                </button>

                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setConfirmDelete(false);
                      }}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {confirmDelete ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span>Delete?</span>
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          disabled={deleteMutation.isPending}
                          className="text-destructive font-medium hover:underline cursor-pointer"
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Yes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="hover:text-foreground cursor-pointer"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1 hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {!isEditing && errorMessage && (
              <p className="text-xs text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {!isReply && replyOpen && (
        <div className="pl-11">
          <CommentComposer
            key={replyPrefix}
            placeholder="Write a reply..."
            submitLabel="Reply"
            initialValue={replyPrefix}
            autoFocus
            isPending={createReplyMutation.isPending}
            error={errorMessage}
            onSubmit={handleCreateReply}
            onCancel={() => {
              setReplyOpen(false);
              setReplyPrefix("");
              setErrorMessage(null);
            }}
          />
        </div>
      )}

      {!isReply && comment.repliesCount > 0 && (
        <div className="pl-11 space-y-3">
          <button
            type="button"
            onClick={() => setRepliesExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            {repliesExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>
              {repliesExpanded ? "Hide" : "View"} {comment.repliesCount}{" "}
              {comment.repliesCount === 1 ? "reply" : "replies"}
            </span>
          </button>

          {repliesExpanded && (
            <div className="space-y-4 border-l border-border/80 pl-4 sm:pl-5 pt-1">
              {repliesQuery.isPending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading replies...</span>
                </div>
              )}

              {repliesQuery.isError && (
                <p className="text-xs text-destructive">
                  Could not load replies.
                </p>
              )}

              {replies.map((reply) => (
                <CommentItemCard
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  viewerId={viewerId}
                  currentUserId={currentUserId}
                  isReply
                  onGuestAction={onGuestAction}
                  onReplyToReply={(mention) => {
                    setReplyPrefix(mention);
                    setReplyOpen(true);
                  }}
                />
              ))}

              {repliesQuery.hasNextPage && (
                <button
                  type="button"
                  onClick={() => repliesQuery.fetchNextPage()}
                  disabled={repliesQuery.isFetchingNextPage}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {repliesQuery.isFetchingNextPage && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Show more replies</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
