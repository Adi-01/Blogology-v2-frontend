export const API_BASE_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/v1/auth/google`;

export const COOKIE_NAMES = {
  SESSION_TOKEN: "session_token",
} as const;

export const CACHE_TAGS = {
  auth: {
    me: () => "auth:me" as const,
    sessions: () => "auth:sessions" as const,
  },
  posts: {
    all: () => "posts:all" as const,
    feed: (type: string) => `posts:feed:${type}` as const,
    detail: (slugOrId: string) => `posts:detail:${slugOrId}` as const,
    user: (username: string) => `posts:user:${username}` as const,
  },
  user: {
    profile: (username: string) => `user:profile:${username}` as const,
  },
  billing: {
    plans: () => "billing:plans" as const,
  },
} as const;

export const PAGE_CONTAINER_CLASS =
  "mx-auto w-full max-w-5xl px-6 sm:px-10 py-10 md:py-14 space-y-8 font-sans";

export const ROUTE_CONTAINER_CLASS = PAGE_CONTAINER_CLASS;


