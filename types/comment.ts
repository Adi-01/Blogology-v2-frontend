export type CommentSort = "top" | "newest";

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

export interface CommentItem {
  id: string;
  postId: string;
  parentId: string | null;
  body: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor | null;
  likesCount: number;
  likedByMe: boolean;
  repliesCount: number;
}

export interface PaginatedCommentsResponse {
  items: CommentItem[];
  total: number;
  totalCommentsCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginatedRepliesResponse {
  items: CommentItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateCommentDto {
  body: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  body: string;
}

export interface CommentLikeResult {
  commentId: string;
  likesCount: number;
  likedByMe: boolean;
}

export interface DeleteCommentResult {
  id: string;
  postId: string;
  parentId: string | null;
  hasActiveReplies: boolean;
}
