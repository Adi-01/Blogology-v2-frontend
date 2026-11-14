"use server";

import { updateTag } from "next/cache";
import { commentService } from "@/lib/services/comment.services";
import { CACHE_TAGS } from "@/lib/constants";
import type { ActionResult } from "@/app/actions/post";
import type {
  CommentItem,
  CommentLikeResult,
  CreateCommentDto,
  DeleteCommentResult,
  UpdateCommentDto,
} from "@/types/comment";

function validateCommentBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return "Comment cannot be empty.";
  if (trimmed.length > 2000) return "Comment must be at most 2000 characters.";
  return null;
}

export async function createCommentAction(
  postId: string,
  dto: CreateCommentDto
): Promise<ActionResult<CommentItem>> {
  const validationError = validateCommentBody(dto.body);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const res = await commentService.createComment(postId, {
    body: dto.body.trim(),
    ...(dto.parentId ? { parentId: dto.parentId } : {}),
  });

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to post comment.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));

  return {
    success: true,
    data: res.data,
  };
}

export async function updateCommentAction(
  postId: string,
  commentId: string,
  dto: UpdateCommentDto
): Promise<ActionResult<CommentItem>> {
  const validationError = validateCommentBody(dto.body);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const res = await commentService.updateComment(commentId, {
    body: dto.body.trim(),
  });

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update comment.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));

  return {
    success: true,
    data: res.data,
  };
}

export async function deleteCommentAction(
  postId: string,
  commentId: string
): Promise<ActionResult<DeleteCommentResult>> {
  const res = await commentService.deleteComment(commentId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to delete comment.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));

  return {
    success: true,
    data: res.data,
  };
}

export async function toggleCommentLikeAction(
  commentId: string,
  currentlyLiked: boolean
): Promise<ActionResult<CommentLikeResult>> {
  const res = currentlyLiked
    ? await commentService.unlikeComment(commentId)
    : await commentService.likeComment(commentId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update comment like.",
    };
  }

  return {
    success: true,
    data: res.data,
  };
}
