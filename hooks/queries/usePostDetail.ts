"use client";

import { useQuery } from "@tanstack/react-query";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Post } from "@/types/post";

export function usePostDetailQuery(
  postId: string,
  viewerId: string,
  initialPost: Post
) {
  return useQuery({
    queryKey: QUERY_KEYS.postDetail(viewerId, postId),
    queryFn: () => clientGet<Post>(`/api/posts/${encodeURIComponent(postId)}`),
    initialData: initialPost,
    staleTime: 60 * 1000,
  });
}
