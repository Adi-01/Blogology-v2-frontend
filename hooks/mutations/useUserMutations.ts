"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { toggleFollowAction, toggleBlockAction } from "@/app/actions/user";
import type { CursorFeedResponse } from "@/types/post";
import type { BlockedUserItem } from "@/types/user";

export function useToggleFollowMutation(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (currentlyFollowing: boolean) =>
      toggleFollowAction(targetUserId, currentlyFollowing),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}

export function useToggleBlockMutation(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (currentlyBlocked: boolean) =>
      toggleBlockAction(targetUserId, currentlyBlocked),
    onMutate: async (currentlyBlocked: boolean) => {
      // Optimistically update blocked users list if unblocking
      await queryClient.cancelQueries({ queryKey: ["users", "blocked"] });
      const previousBlocked = queryClient.getQueriesData<BlockedUserItem[]>({
        queryKey: ["users", "blocked"],
      });

      if (currentlyBlocked) {
        // Unblocking: remove immediately from in-memory cache
        queryClient.setQueriesData<BlockedUserItem[]>(
          { queryKey: ["users", "blocked"] },
          (old) => (old ? old.filter((item) => item.id !== targetUserId) : [])
        );
      }

      return { previousBlocked };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBlocked) {
        for (const [key, data] of context.previousBlocked) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSuccess: (res) => {
      if (res.success && res.isBlocked) {
        // Immediately purge blocked author's posts from in-memory feed caches without reload
        queryClient.setQueriesData<InfiniteData<CursorFeedResponse>>(
          { queryKey: ["feed"] },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter(
                  (item) =>
                    item.authorId !== targetUserId &&
                    item.author?.id !== targetUserId
                ),
              })),
            };
          }
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "blocked"] });
      queryClient.invalidateQueries({ queryKey: ["users", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}
