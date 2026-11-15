"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
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
import type {
  CreatePostDto,
  CursorFeedResponse,
  PaginatedPosts,
  Post,
  UpdatePostDto,
} from "@/types/post";

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
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts", "mine"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      const previousMine = queryClient.getQueriesData<PaginatedPosts>({
        queryKey: ["posts", "mine"],
      });
      const previousBookmarks = queryClient.getQueriesData<
        InfiniteData<CursorFeedResponse>
      >({ queryKey: ["bookmarks"] });

      queryClient.setQueriesData<PaginatedPosts>(
        { queryKey: ["posts", "mine"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== postId),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      queryClient.setQueriesData<InfiniteData<CursorFeedResponse>>(
        { queryKey: ["bookmarks"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.filter((item) => item.id !== postId),
            })),
          };
        }
      );

      return { previousMine, previousBookmarks };
    },
    onError: (_err, _vars, context) => {
      context?.previousMine?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousBookmarks?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (res, _vars, context) => {
      if (!res.success) {
        context?.previousMine?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        context?.previousBookmarks?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
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
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      const previous = queryClient.getQueryData<Post>(detailKey);
      const previousBookmarks = queryClient.getQueriesData<
        InfiniteData<CursorFeedResponse>
      >({ queryKey: ["bookmarks"] });

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

      if (currentlyBookmarked) {
        queryClient.setQueriesData<InfiniteData<CursorFeedResponse>>(
          { queryKey: ["bookmarks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.filter((item) => item.id !== postId),
              })),
            };
          }
        );
      }

      return { previous, previousBookmarks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
      context?.previousBookmarks?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (res, _vars, context) => {
      if (!res.success) {
        if (context?.previous) {
          queryClient.setQueryData(detailKey, context.previous);
        }
        context?.previousBookmarks?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
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
