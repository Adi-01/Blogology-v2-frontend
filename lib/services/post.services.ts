import { cache } from "react";
import { cookies } from "next/headers";
import { cacheTag, cacheLife } from "next/cache";
import { executeFetch } from "@/lib/api/core";
import { apiServerAction } from "@/lib/api/server-action";
import { API_BASE_URL, CACHE_TAGS, COOKIE_NAMES } from "@/lib/constants";
import type {
  Post,
  CreatePostDto,
  UpdatePostDto,
  PaginatedPosts,
  PostLikeResult,
  PostBookmarkResult,
} from "@/types/post";

async function fetchPostByIdCached(id: string, token?: string): Promise<Post | null> {
  "use cache";
  cacheTag(CACHE_TAGS.posts.detail(id));
  cacheLife("minutes");

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers.Cookie = `${COOKIE_NAMES.SESSION_TOKEN}=${token}`;
  }

  const res = await executeFetch<Post>(`${API_BASE_URL}/api/v1/posts/${id}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    return null;
  }

  return res.data;
}

export const postService = {
  // Read single post (cached per post + optional session token for author draft previews)
  getPostById: cache(async (id: string): Promise<Post | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    return fetchPostByIdCached(id, token);
  }),

  // Read own posts
  getMyPosts: cache(async (page = 1, limit = 10, status?: string): Promise<PaginatedPosts | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return null;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status ? { status } : {}),
    });

    const res = await executeFetch<PaginatedPosts>(
      `${API_BASE_URL}/api/v1/posts/mine?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.data;
  }),

  // Mutations
  createDraft: (body: CreatePostDto) =>
    apiServerAction.mutate<Post, CreatePostDto>("/api/v1/posts", {
      method: "POST",
      body,
    }),

  updatePost: (id: string, body: UpdatePostDto) =>
    apiServerAction.mutate<Post, UpdatePostDto>(`/api/v1/posts/${id}`, {
      method: "PATCH",
      body,
    }),

  publishPost: (id: string) =>
    apiServerAction.mutate<Post>(`/api/v1/posts/${id}/publish`, {
      method: "POST",
    }),

  unpublishPost: (id: string) =>
    apiServerAction.mutate<Post>(`/api/v1/posts/${id}/unpublish`, {
      method: "POST",
    }),

  deletePost: (id: string) =>
    apiServerAction.mutate<null>(`/api/v1/posts/${id}`, {
      method: "DELETE",
    }),

  likePost: (id: string) =>
    apiServerAction.mutate<PostLikeResult>(`/api/v1/posts/${id}/like`, {
      method: "POST",
    }),

  unlikePost: (id: string) =>
    apiServerAction.mutate<PostLikeResult>(`/api/v1/posts/${id}/like`, {
      method: "DELETE",
    }),

  bookmarkPost: (id: string) =>
    apiServerAction.mutate<PostBookmarkResult>(`/api/v1/posts/${id}/bookmark`, {
      method: "POST",
    }),

  unbookmarkPost: (id: string) =>
    apiServerAction.mutate<PostBookmarkResult>(`/api/v1/posts/${id}/bookmark`, {
      method: "DELETE",
    }),
};

