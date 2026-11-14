"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@/components/providers/user-provider";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CursorFeedResponse } from "@/types/post";
import type { CursorUsersResponse } from "@/types/search";

export function useSearchPostsQuery(query: string, enabled = true) {
  const { user } = useUser();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.search(user?.id ?? "guest", "posts", query),
    queryFn: ({ pageParam }) =>
      clientGet<CursorFeedResponse>("/api/search", {
        type: "posts",
        q: query,
        limit: 10,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: enabled && query.length > 0,
  });
}

export function useSearchUsersQuery(query: string, enabled = true) {
  const { user } = useUser();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.search(user?.id ?? "guest", "users", query),
    queryFn: ({ pageParam }) =>
      clientGet<CursorUsersResponse>("/api/search", {
        type: "users",
        q: query,
        limit: 10,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: enabled && query.length > 0,
  });
}
