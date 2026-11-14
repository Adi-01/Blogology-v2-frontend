"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCommentAction,
  deleteCommentAction,
  toggleCommentLikeAction,
  updateCommentAction,
} from "@/app/actions/comment";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CreateCommentDto, UpdateCommentDto } from "@/types/comment";

export function useCreateCommentMutation(postId: string, viewerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => createCommentAction(postId, dto),
    onSuccess: (res, dto) => {
      if (!res.success) return;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (dto.parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, dto.parentId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.postDetail(viewerId, postId),
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useUpdateCommentMutation(
  postId: string,
  viewerId: string,
  parentId?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      dto,
    }: {
      commentId: string;
      dto: UpdateCommentDto;
    }) => updateCommentAction(postId, commentId, dto),
    onSuccess: (res) => {
      if (!res.success) return;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
    },
  });
}

export function useDeleteCommentMutation(
  postId: string,
  viewerId: string,
  parentId?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentAction(postId, commentId),
    onSuccess: (res) => {
      if (!res.success) return;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.postDetail(viewerId, postId),
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useToggleCommentLikeMutation(
  postId: string,
  viewerId: string,
  parentId?: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      currentlyLiked,
    }: {
      commentId: string;
      currentlyLiked: boolean;
    }) => toggleCommentLikeAction(commentId, currentlyLiked),
    onSuccess: (res) => {
      if (!res.success) return;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
    },
  });
}
