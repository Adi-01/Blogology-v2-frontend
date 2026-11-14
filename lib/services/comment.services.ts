import { apiServerAction } from "@/lib/api/server-action";
import type {
  CommentItem,
  CommentLikeResult,
  CreateCommentDto,
  DeleteCommentResult,
  UpdateCommentDto,
} from "@/types/comment";

export const commentService = {
  createComment: (postId: string, body: CreateCommentDto) =>
    apiServerAction.mutate<CommentItem, CreateCommentDto>(
      `/api/v1/posts/${postId}/comments`,
      {
        method: "POST",
        body,
      }
    ),

  updateComment: (commentId: string, body: UpdateCommentDto) =>
    apiServerAction.mutate<CommentItem, UpdateCommentDto>(
      `/api/v1/comments/${commentId}`,
      {
        method: "PATCH",
        body,
      }
    ),

  deleteComment: (commentId: string) =>
    apiServerAction.mutate<DeleteCommentResult>(
      `/api/v1/comments/${commentId}`,
      {
        method: "DELETE",
      }
    ),

  likeComment: (commentId: string) =>
    apiServerAction.mutate<CommentLikeResult>(
      `/api/v1/comments/${commentId}/like`,
      {
        method: "POST",
      }
    ),

  unlikeComment: (commentId: string) =>
    apiServerAction.mutate<CommentLikeResult>(
      `/api/v1/comments/${commentId}/like`,
      {
        method: "DELETE",
      }
    ),
};
