"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  createCommentAction,
  deleteCommentAction,
  toggleCommentLikeAction,
  updateCommentAction,
} from "@/app/actions/comment";
import { useUser } from "@/components/providers/user-provider";
import { QUERY_KEYS } from "@/lib/query-keys";
import type {
  CommentAuthor,
  CommentItem,
  CreateCommentDto,
  PaginatedCommentsResponse,
  PaginatedRepliesResponse,
  UpdateCommentDto,
} from "@/types/comment";
import type { Post } from "@/types/post";

export function useCreateCommentMutation(
  postId: string,
  viewerId: string,
  authorOverride?: CommentAuthor | null
) {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const author: CommentAuthor | null =
    authorOverride ??
    (user
      ? {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        }
      : null);

  const detailKey = QUERY_KEYS.postDetail(viewerId, postId);

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => createCommentAction(postId, dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      if (dto.parentId) {
        await queryClient.cancelQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, dto.parentId),
        });
      }
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousComments = queryClient.getQueriesData<
        InfiniteData<PaginatedCommentsResponse>
      >({ queryKey: ["comments", postId] });

      const previousReplies = dto.parentId
        ? queryClient.getQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, dto.parentId)
          )
        : undefined;

      const previousDetail = queryClient.getQueryData<Post>(detailKey);

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      if (author) {
        const optimisticComment: CommentItem = {
          id: tempId,
          postId,
          parentId: dto.parentId ?? null,
          body: dto.body.trim(),
          isDeleted: false,
          isEdited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author,
          likesCount: 0,
          likedByMe: false,
          repliesCount: 0,
        };

        if (dto.parentId) {
          queryClient.setQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, dto.parentId),
            (old) => {
              if (!old) {
                return {
                  pageParams: [1],
                  pages: [
                    {
                      items: [optimisticComment],
                      total: 1,
                      page: 1,
                      limit: 10,
                      hasMore: false,
                    },
                  ],
                };
              }
              const firstPage = old.pages[0];
              if (!firstPage) return old;
              return {
                ...old,
                pages: [
                  {
                    ...firstPage,
                    items: [...firstPage.items, optimisticComment],
                    total: firstPage.total + 1,
                  },
                  ...old.pages.slice(1),
                ],
              };
            }
          );

          queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
            { queryKey: ["comments", postId] },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  totalCommentsCount: p.totalCommentsCount + 1,
                  items: p.items.map((c) =>
                    c.id === dto.parentId
                      ? { ...c, repliesCount: c.repliesCount + 1 }
                      : c
                  ),
                })),
              };
            }
          );
        } else {
          queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
            { queryKey: ["comments", postId] },
            (old) => {
              if (!old) {
                return {
                  pageParams: [1],
                  pages: [
                    {
                      items: [optimisticComment],
                      total: 1,
                      totalCommentsCount: 1,
                      page: 1,
                      limit: 15,
                      hasMore: false,
                    },
                  ],
                };
              }
              const firstPage = old.pages[0];
              if (!firstPage) return old;
              return {
                ...old,
                pages: [
                  {
                    ...firstPage,
                    items: [optimisticComment, ...firstPage.items],
                    total: firstPage.total + 1,
                    totalCommentsCount: firstPage.totalCommentsCount + 1,
                  },
                  ...old.pages.slice(1),
                ],
              };
            }
          );
        }

        if (previousDetail) {
          queryClient.setQueryData<Post>(detailKey, {
            ...previousDetail,
            commentsCount: previousDetail.commentsCount + 1,
          });
        }
      }

      return { previousComments, previousReplies, previousDetail, tempId };
    },
    onError: (_err, dto, context) => {
      context?.previousComments?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (dto.parentId && context?.previousReplies) {
        queryClient.setQueryData(
          QUERY_KEYS.commentReplies(viewerId, dto.parentId),
          context.previousReplies
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
    },
    onSuccess: (res, dto, context) => {
      if (!res.success) {
        context?.previousComments?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (dto.parentId && context?.previousReplies) {
          queryClient.setQueryData(
            QUERY_KEYS.commentReplies(viewerId, dto.parentId),
            context.previousReplies
          );
        }
        if (context?.previousDetail) {
          queryClient.setQueryData(detailKey, context.previousDetail);
        }
        return;
      }

      if (context?.tempId && res.data) {
        const serverComment = res.data;
        if (dto.parentId) {
          queryClient.setQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, dto.parentId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((item) =>
                    item.id === context.tempId ? serverComment : item
                  ),
                })),
              };
            }
          );
        } else {
          queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
            { queryKey: ["comments", postId] },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((item) =>
                    item.id === context.tempId ? serverComment : item
                  ),
                })),
              };
            }
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (dto.parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, dto.parentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: detailKey });
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
  const detailKey = QUERY_KEYS.postDetail(viewerId, postId);

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentAction(postId, commentId),
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        await queryClient.cancelQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousComments = queryClient.getQueriesData<
        InfiniteData<PaginatedCommentsResponse>
      >({ queryKey: ["comments", postId] });

      const previousReplies = parentId
        ? queryClient.getQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, parentId)
          )
        : undefined;

      const previousDetail = queryClient.getQueryData<Post>(detailKey);

      if (previousDetail) {
        queryClient.setQueryData<Post>(detailKey, {
          ...previousDetail,
          commentsCount: Math.max(0, previousDetail.commentsCount - 1),
        });
      }

      if (parentId) {
        queryClient.setQueryData<InfiniteData<PaginatedRepliesResponse>>(
          QUERY_KEYS.commentReplies(viewerId, parentId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.filter((item) => item.id !== commentId),
                total: Math.max(0, p.total - 1),
              })),
            };
          }
        );

        queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                totalCommentsCount: Math.max(0, p.totalCommentsCount - 1),
                items: p.items.map((c) =>
                  c.id === parentId
                    ? { ...c, repliesCount: Math.max(0, c.repliesCount - 1) }
                    : c
                ),
              })),
            };
          }
        );
      } else {
        queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => {
                const target = p.items.find((c) => c.id === commentId);
                const hasReplies = target && target.repliesCount > 0;
                return {
                  ...p,
                  totalCommentsCount: Math.max(0, p.totalCommentsCount - 1),
                  total: hasReplies ? p.total : Math.max(0, p.total - 1),
                  items: hasReplies
                    ? p.items.map((c) =>
                        c.id === commentId
                          ? { ...c, isDeleted: true, body: null, author: null }
                          : c
                      )
                    : p.items.filter((c) => c.id !== commentId),
                };
              }),
            };
          }
        );
      }

      return { previousComments, previousReplies, previousDetail };
    },
    onError: (_err, _vars, context) => {
      context?.previousComments?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (parentId && context?.previousReplies) {
        queryClient.setQueryData(
          QUERY_KEYS.commentReplies(viewerId, parentId),
          context.previousReplies
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
    },
    onSuccess: (res, _vars, context) => {
      if (!res.success) {
        context?.previousComments?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (parentId && context?.previousReplies) {
          queryClient.setQueryData(
            QUERY_KEYS.commentReplies(viewerId, parentId),
            context.previousReplies
          );
        }
        if (context?.previousDetail) {
          queryClient.setQueryData(detailKey, context.previousDetail);
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: detailKey });
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
    onMutate: async ({ commentId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        await queryClient.cancelQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }

      const previousComments = queryClient.getQueriesData<
        InfiniteData<PaginatedCommentsResponse>
      >({ queryKey: ["comments", postId] });

      const previousReplies = parentId
        ? queryClient.getQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, parentId)
          )
        : undefined;

      const nextLiked = !currentlyLiked;
      const countDiff = currentlyLiked ? -1 : 1;

      queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
        { queryKey: ["comments", postId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.map((item) =>
                item.id === commentId
                  ? {
                      ...item,
                      likedByMe: nextLiked,
                      likesCount: Math.max(0, item.likesCount + countDiff),
                    }
                  : item
              ),
            })),
          };
        }
      );

      if (parentId) {
        queryClient.setQueryData<InfiniteData<PaginatedRepliesResponse>>(
          QUERY_KEYS.commentReplies(viewerId, parentId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.map((item) =>
                  item.id === commentId
                    ? {
                        ...item,
                        likedByMe: nextLiked,
                        likesCount: Math.max(0, item.likesCount + countDiff),
                      }
                    : item
                ),
              })),
            };
          }
        );
      }

      return { previousComments, previousReplies };
    },
    onError: (_err, _vars, context) => {
      context?.previousComments?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (parentId && context?.previousReplies) {
        queryClient.setQueryData(
          QUERY_KEYS.commentReplies(viewerId, parentId),
          context.previousReplies
        );
      }
    },
    onSuccess: (res, { commentId }, context) => {
      if (!res.success) {
        context?.previousComments?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (parentId && context?.previousReplies) {
          queryClient.setQueryData(
            QUERY_KEYS.commentReplies(viewerId, parentId),
            context.previousReplies
          );
        }
        return;
      }

      if (res.data) {
        const { likesCount, likedByMe } = res.data;
        queryClient.setQueriesData<InfiniteData<PaginatedCommentsResponse>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.map((item) =>
                  item.id === commentId
                    ? { ...item, likesCount, likedByMe }
                    : item
                ),
              })),
            };
          }
        );

        if (parentId) {
          queryClient.setQueryData<InfiniteData<PaginatedRepliesResponse>>(
            QUERY_KEYS.commentReplies(viewerId, parentId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((item) =>
                    item.id === commentId
                      ? { ...item, likesCount, likedByMe }
                      : item
                  ),
                })),
              };
            }
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.commentReplies(viewerId, parentId),
        });
      }
    },
  });
}
