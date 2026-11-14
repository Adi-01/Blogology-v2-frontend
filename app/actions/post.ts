"use server";

import { updateTag } from "next/cache";
import { postService } from "@/lib/services/post.services";
import { CACHE_TAGS } from "@/lib/constants";
import type {
  Post,
  CreatePostDto,
  UpdatePostDto,
  PostLikeResult,
  PostBookmarkResult,
} from "@/types/post";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function createDraftAction(dto: CreatePostDto): Promise<ActionResult<Post>> {
  if (!dto.title || !dto.title.trim()) {
    dto.title = "Untitled Post";
  }

  const res = await postService.createDraft(dto);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to create draft.",
    };
  }

  updateTag(CACHE_TAGS.posts.all());

  return {
    success: true,
    data: res.data,
  };
}

export async function updateDraftAction(
  postId: string,
  dto: UpdatePostDto
): Promise<ActionResult<Post>> {
  const res = await postService.updatePost(postId, dto);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to save draft.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));
  updateTag(CACHE_TAGS.posts.all());

  return {
    success: true,
    data: res.data,
  };
}

export async function publishPostAction(postId: string): Promise<ActionResult<Post>> {
  const res = await postService.publishPost(postId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to publish post.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));
  updateTag(CACHE_TAGS.posts.all());
  updateTag(CACHE_TAGS.posts.feed("for-you"));
  updateTag(CACHE_TAGS.posts.feed("explore"));

  return {
    success: true,
    data: res.data,
  };
}

export async function unpublishPostAction(postId: string): Promise<ActionResult<Post>> {
  const res = await postService.unpublishPost(postId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to unpublish post.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));
  updateTag(CACHE_TAGS.posts.all());
  updateTag(CACHE_TAGS.posts.feed("for-you"));
  updateTag(CACHE_TAGS.posts.feed("explore"));

  return {
    success: true,
    data: res.data,
  };
}

export async function deletePostAction(postId: string): Promise<ActionResult<null>> {
  const res = await postService.deletePost(postId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to delete post.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));
  updateTag(CACHE_TAGS.posts.all());
  updateTag(CACHE_TAGS.posts.feed("for-you"));
  updateTag(CACHE_TAGS.posts.feed("explore"));

  return {
    success: true,
  };
}

export async function toggleLikePostAction(
  postId: string,
  currentlyLiked: boolean
): Promise<ActionResult<PostLikeResult>> {
  const res = currentlyLiked
    ? await postService.unlikePost(postId)
    : await postService.likePost(postId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update like.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));

  return {
    success: true,
    data: res.data,
  };
}

export async function toggleBookmarkPostAction(
  postId: string,
  currentlyBookmarked: boolean
): Promise<ActionResult<PostBookmarkResult>> {
  const res = currentlyBookmarked
    ? await postService.unbookmarkPost(postId)
    : await postService.bookmarkPost(postId);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update bookmark.",
    };
  }

  updateTag(CACHE_TAGS.posts.detail(postId));

  return {
    success: true,
    data: res.data,
  };
}

