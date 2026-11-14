"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type {
  UserRelationship,
  CursorSocialUsersResponse,
  BlockedUserItem,
} from "@/types/user";
import type { CursorFeedResponse } from "@/types/post";

export function useUserRelationship(
  targetUserId: string,
  viewerId?: string,
  initialData?: UserRelationship
) {
  return useQuery({
    queryKey: QUERY_KEYS.userRelationship(viewerId ?? "guest", targetUserId),
    queryFn: () =>
      clientGet<UserRelationship>(`/api/users/${targetUserId}/relationship`),
    enabled: Boolean(viewerId && viewerId !== "guest" && viewerId !== targetUserId),
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useUserFollowers(targetUserId: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.userFollowers(targetUserId),
    queryFn: ({ pageParam }) =>
      clientGet<CursorSocialUsersResponse>(
        `/api/users/${targetUserId}/followers`,
        {
          cursor: pageParam,
          limit: 20,
        }
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}

export function useUserFollowing(targetUserId: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.userFollowing(targetUserId),
    queryFn: ({ pageParam }) =>
      clientGet<CursorSocialUsersResponse>(
        `/api/users/${targetUserId}/following`,
        {
          cursor: pageParam,
          limit: 20,
        }
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}

export function useBlockedUsers(viewerId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blockedUsers(viewerId ?? "guest"),
    queryFn: () => clientGet<BlockedUserItem[]>("/api/users/blocked"),
    enabled: Boolean(viewerId && viewerId !== "guest"),
  });
}

export function useAuthorPosts(username: string, initialData?: CursorFeedResponse) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.authorPosts(username),
    queryFn: ({ pageParam }) =>
      clientGet<CursorFeedResponse>(`/api/users/${username}/posts`, {
        cursor: pageParam,
        limit: 10,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    ...(initialData
      ? {
          initialData: {
            pages: [initialData],
            pageParams: [undefined],
          },
        }
      : {}),
  });
}
