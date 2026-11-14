export type PostStatus = "DRAFT" | "PUBLISHED";

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: any;
  coverImage: string | null;
  status: PostStatus;
  score: number;
  readingTime: number;
  viewCount: number;
  summary: string | null;
  summarisedAt: string | null;
  isDeleted: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  tags: string[];
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
  isFollowedAuthor?: boolean;
}

export interface PostLikeResult {
  postId: string;
  likesCount: number;
  likedByMe: boolean;
}

export interface PostBookmarkResult {
  postId: string;
  bookmarksCount: number;
  bookmarkedByMe: boolean;
}

export interface CreatePostDto {
  title: string;
  content?: any;
  coverImage?: string | null;
  tags?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: any;
  coverImage?: string | null;
  tags?: string[];
}

export interface PaginatedPosts {
  items: Post[];
  stats?: {
    totalViews: number;
    totalLikes: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedPostItem extends Omit<Post, "content"> {
  excerpt: string;
  baseScore?: number;
  isFollowedAuthor?: boolean;
}

export interface CursorFeedResponse {
  items: FeedPostItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

