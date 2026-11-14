export interface UserRelationship {
  userId: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isBlockedBy: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FollowUserResult {
  targetUserId: string;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface BlockUserResult {
  targetUserId: string;
  isBlocked: boolean;
}

export interface SocialUserItem {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  postsCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
  isSelf?: boolean;
}

export interface CursorSocialUsersResponse {
  items: SocialUserItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface BlockedUserItem {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  blockedAt: string;
}

export interface AuthorPublicProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isBlockedBy: boolean;
  isSelf: boolean;
}

export interface TagItem {
  id: string;
  name: string;
}
