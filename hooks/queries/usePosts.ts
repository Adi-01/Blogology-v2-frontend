"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/providers/user-provider";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PaginatedPosts, PostStatus } from "@/types/post";

export function useMyPostsQuery(page: number, status?: PostStatus) {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.postsMine(user?.id ?? "", page, status),
    queryFn: () =>
      clientGet<PaginatedPosts>("/api/posts/mine", {
        page,
        limit: 20,
        status,
      }),
    enabled: Boolean(user),
  });
}

export function useMyPostsSummaryQuery(enabled: boolean) {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.postsMine(user?.id ?? "", 1, "SUMMARY_ALL"),
    queryFn: () =>
      clientGet<PaginatedPosts>("/api/posts/mine", {
        page: 1,
        limit: 50,
      }),
    enabled: Boolean(user) && enabled,
  });
}
