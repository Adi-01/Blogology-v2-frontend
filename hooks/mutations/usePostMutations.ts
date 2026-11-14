"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDraftAction,
  updateDraftAction,
  publishPostAction,
  unpublishPostAction,
  deletePostAction,
  toggleLikePostAction,
  toggleBookmarkPostAction,
} from "@/app/actions/post";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CreatePostDto, Post, UpdatePostDto } from "@/types/post";

export function useCreateDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePostDto) => createDraftAction(dto),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      }
    },
  });
}

export function useUpdateDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, dto }: { postId: string; dto: UpdatePostDto }) =>
      updateDraftAction(postId, dto),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      }
    },
  });
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => publishPostAction(postId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    },
  });
}

export function useUnpublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => unpublishPostAction(postId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePostAction(postId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    },
  });
}

export function useToggleLikePostMutation(postId: string, viewerId: string) {
  const queryClient = useQueryClient();
  const detailKey = QUERY_KEYS.postDetail(viewerId, postId);

  return useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      toggleLikePostAction(postId, currentlyLiked),
    onMutate: async (currentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<Post>(detailKey);

      if (previous) {
        queryClient.setQueryData<Post>(detailKey, {
          ...previous,
          likedByMe: !currentlyLiked,
          likesCount: Math.max(0, previous.likesCount + (currentlyLiked ? -1 : 1)),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSuccess: (res, _vars, context) => {
      if (!res.success) {
        if (context?.previous) {
          queryClient.setQueryData(detailKey, context.previous);
        }
        return;
      }

      if (res.data) {
        queryClient.setQueryData<Post>(detailKey, (current) =>
          current
            ? {
                ...current,
                likesCount: res.data!.likesCount,
                likedByMe: res.data!.likedByMe,
              }
            : current
        );
      }

      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
    },
  });
}

export function useToggleBookmarkPostMutation(postId: string, viewerId: string) {
  const queryClient = useQueryClient();
  const detailKey = QUERY_KEYS.postDetail(viewerId, postId);

  return useMutation({
    mutationFn: (currentlyBookmarked: boolean) =>
      toggleBookmarkPostAction(postId, currentlyBookmarked),
    onMutate: async (currentlyBookmarked) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<Post>(detailKey);

      if (previous) {
        queryClient.setQueryData<Post>(detailKey, {
          ...previous,
          bookmarkedByMe: !currentlyBookmarked,
          bookmarksCount: Math.max(
            0,
            previous.bookmarksCount + (currentlyBookmarked ? -1 : 1)
          ),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSuccess: (res, _vars, context) => {
      if (!res.success) {
        if (context?.previous) {
          queryClient.setQueryData(detailKey, context.previous);
        }
        return;
      }

      if (res.data) {
        queryClient.setQueryData<Post>(detailKey, (current) =>
          current
            ? {
                ...current,
                bookmarksCount: res.data!.bookmarksCount,
                bookmarkedByMe: res.data!.bookmarkedByMe,
              }
            : current
        );
      }

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
    },
  });
}
