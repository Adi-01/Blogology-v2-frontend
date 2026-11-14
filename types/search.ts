export type SearchTab = "posts" | "users";

export interface SearchUserItem {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export interface CursorUsersResponse {
  items: SearchUserItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
