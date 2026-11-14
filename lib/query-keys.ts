import type { CommentSort } from "@/types/comment";

export const QUERY_KEYS = {
  me: () => ["auth", "me"] as const,
  feed: (userId: string, type: "for-you" | "explore") =>
    ["feed", type, userId] as const,
  bookmarks: (userId: string) => ["bookmarks", userId] as const,
  search: (userId: string, tab: "posts" | "users", q: string) =>
    ["search", tab, q, userId] as const,
  postsMine: (userId: string, page: number, status?: string) =>
    ["posts", "mine", userId, { page, status: status ?? "ALL" }] as const,
  postDetail: (viewerId: string, postId: string) =>
    ["posts", "detail", postId, viewerId] as const,
  comments: (viewerId: string, postId: string, sort: CommentSort) =>
    ["comments", postId, sort, viewerId] as const,
  commentReplies: (viewerId: string, commentId: string) =>
    ["comments", "replies", commentId, viewerId] as const,
  sessions: (userId: string) => ["auth", "sessions", userId] as const,
  userRelationship: (viewerId: string, targetUserId: string) =>
    ["users", targetUserId, "relationship", viewerId] as const,
  userFollowers: (targetUserId: string) =>
    ["users", targetUserId, "followers"] as const,
  userFollowing: (targetUserId: string) =>
    ["users", targetUserId, "following"] as const,
  authorPosts: (username: string) =>
    ["users", username, "posts"] as const,
  blockedUsers: (userId: string) =>
    ["users", "blocked", userId] as const,
  plans: () => ["billing", "plans"] as const,
} as const;
