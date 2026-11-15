import { cache } from "react";
import { cookies } from "next/headers";
import { cacheTag, cacheLife } from "next/cache";
import { executeFetch } from "@/lib/api/core";
import { apiServerAction } from "@/lib/api/server-action";
import { API_BASE_URL, COOKIE_NAMES, CACHE_TAGS } from "@/lib/constants";
import type { AuthUser, UserSessionView } from "@/types/auth";
import type {
  UserRelationship,
  FollowUserResult,
  BlockUserResult,
  CursorSocialUsersResponse,
  BlockedUserItem,
  AuthorPublicProfile,
  TagItem,
} from "@/types/user";
import type { CursorFeedResponse } from "@/types/post";

async function fetchSessionsByToken(token: string): Promise<UserSessionView[]> {
  "use cache";
  cacheTag(CACHE_TAGS.auth.sessions());
  cacheLife("minutes");

  const res = await executeFetch<UserSessionView[]>(`${API_BASE_URL}/api/v1/auth/sessions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  return res.data;
}

async function fetchUserProfileCached(username: string): Promise<AuthorPublicProfile | null> {
  "use cache";
  cacheTag(CACHE_TAGS.user.profile(username));
  cacheLife("hours");

  const res = await executeFetch<AuthorPublicProfile>(
    `${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}`,
    {
      method: "GET",
    }
  );

  return res.ok ? res.data : null;
}

async function fetchAllTags(): Promise<TagItem[]> {
  const res = await executeFetch<TagItem[]>(`${API_BASE_URL}/api/v1/users/tags`, {
    method: "GET",
  });

  return res.ok ? res.data : [];
}

export const userService = {
  // Reads
  // Live session verification (deduplicated per request via React cache)
  getCurrentUser: cache(async (): Promise<AuthUser | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return null;

    const res = await executeFetch<AuthUser>(`${API_BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    return res.data;
  }),

  // Cached sessions across hard refreshes (keyed by session token argument)
  getSessions: cache(async (): Promise<UserSessionView[]> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return [];

    return fetchSessionsByToken(token);
  }),

  // Writes
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiServerAction.mutate<null, { currentPassword: string; newPassword: string }>(
      "/api/v1/auth/password",
      { method: "PATCH", body }
    ),

  revokeSession: (sessionId: string) =>
    apiServerAction.mutate<null>(`/api/v1/auth/sessions/${sessionId}`, {
      method: "DELETE",
    }),

  deleteAccount: () =>
    apiServerAction.mutate<null>("/api/v1/users/me", {
      method: "DELETE",
    }),

  // Social Reads
  getRelationship: async (targetUserId: string): Promise<UserRelationship | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return null;

    const res = await executeFetch<UserRelationship>(
      `${API_BASE_URL}/api/v1/users/${targetUserId}/relationship`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
        },
      }
    );

    return res.ok ? res.data : null;
  },

  getFollowers: async (
    targetUserId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorSocialUsersResponse | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const url = new URL(`${API_BASE_URL}/api/v1/users/${targetUserId}/followers`);
    if (params?.cursor) url.searchParams.set("cursor", params.cursor);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    const res = await executeFetch<CursorSocialUsersResponse>(url.toString(), {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
          }
        : {},
    });

    return res.ok ? res.data : null;
  },

  getFollowing: async (
    targetUserId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorSocialUsersResponse | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const url = new URL(`${API_BASE_URL}/api/v1/users/${targetUserId}/following`);
    if (params?.cursor) url.searchParams.set("cursor", params.cursor);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    const res = await executeFetch<CursorSocialUsersResponse>(url.toString(), {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
          }
        : {},
    });

    return res.ok ? res.data : null;
  },

  getBlockedUsers: async (): Promise<BlockedUserItem[]> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return [];

    const res = await executeFetch<BlockedUserItem[]>(
      `${API_BASE_URL}/api/v1/users/blocked`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
        },
      }
    );

    return res.ok ? res.data : [];
  },

  getUserProfileByUsername: async (username: string): Promise<AuthorPublicProfile | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    if (!token) {
      return fetchUserProfileCached(username);
    }

    const res = await executeFetch<AuthorPublicProfile>(
      `${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
        },
      }
    );

    return res.ok ? res.data : null;
  },

  getUserPostsByUsername: async (
    username: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorFeedResponse | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const url = new URL(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}/posts`);
    if (params?.cursor) url.searchParams.set("cursor", params.cursor);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    const res = await executeFetch<CursorFeedResponse>(url.toString(), {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
          }
        : {},
    });

    return res.ok ? res.data : null;
  },

  getAllTags: async (): Promise<TagItem[]> => {
    return fetchAllTags();
  },

  getUserInterests: async (): Promise<TagItem[]> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    if (!token) return [];

    const res = await executeFetch<TagItem[]>(
      `${API_BASE_URL}/api/v1/users/me/interests`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
        },
      }
    );

    return res.ok ? res.data : [];
  },

  // Social Writes
  updateProfile: (body: { name?: string; bio?: string | null; avatar?: string | null }) =>
    apiServerAction.mutate<AuthUser, { name?: string; bio?: string | null; avatar?: string | null }>(
      "/api/v1/users/me",
      { method: "PATCH", body }
    ),

  saveInterests: (tagIds: string[]) =>
    apiServerAction.mutate<{ success: boolean; count: number }, { tagIds: string[] }>(
      "/api/v1/users/me/interests",
      { method: "POST", body: { tagIds } }
    ),

  toggleFollow: (targetUserId: string, follow?: boolean) =>
    apiServerAction.mutate<FollowUserResult, { follow?: boolean }>(
      `/api/v1/users/${targetUserId}/follow`,
      {
        method: "POST",
        body: follow !== undefined ? { follow } : undefined,
      }
    ),

  unfollow: (targetUserId: string) =>
    apiServerAction.mutate<FollowUserResult>(
      `/api/v1/users/${targetUserId}/follow`,
      {
        method: "DELETE",
      }
    ),

  toggleBlock: (targetUserId: string, block?: boolean) =>
    apiServerAction.mutate<BlockUserResult, { block?: boolean }>(
      `/api/v1/users/${targetUserId}/block`,
      {
        method: "POST",
        body: block !== undefined ? { block } : undefined,
      }
    ),

  unblock: (targetUserId: string) =>
    apiServerAction.mutate<BlockUserResult>(
      `/api/v1/users/${targetUserId}/block`,
      {
        method: "DELETE",
      }
    ),
};




