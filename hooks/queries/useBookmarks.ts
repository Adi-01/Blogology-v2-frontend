"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@/components/providers/user-provider";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CursorFeedResponse } from "@/types/post";

export function useBookmarksQuery() {
  const { user } = useUser();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.bookmarks(user?.id ?? "guest"),
    queryFn: ({ pageParam }) =>
      clientGet<CursorFeedResponse>("/api/bookmarks", {
        limit: 10,
        cursor: pageParam,
      }),
    enabled: Boolean(user),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}
