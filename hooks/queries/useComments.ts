"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type {
  CommentSort,
  PaginatedCommentsResponse,
  PaginatedRepliesResponse,
} from "@/types/comment";

export function useCommentsQuery(
  postId: string,
  sort: CommentSort,
  viewerId: string
) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.comments(viewerId, postId, sort),
    queryFn: ({ pageParam }) =>
      clientGet<PaginatedCommentsResponse>(
        `/api/posts/${encodeURIComponent(postId)}/comments`,
        {
          sort,
          page: pageParam,
          limit: 15,
        }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}

export function useCommentRepliesQuery(
  commentId: string,
  viewerId: string,
  enabled: boolean
) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.commentReplies(viewerId, commentId),
    queryFn: ({ pageParam }) =>
      clientGet<PaginatedRepliesResponse>(
        `/api/comments/${encodeURIComponent(commentId)}/replies`,
        {
          page: pageParam,
          limit: 10,
        }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
  });
}
