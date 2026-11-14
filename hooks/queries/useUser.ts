"use client";

import { useQuery } from "@tanstack/react-query";
import { clientGet, ClientHttpError } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AuthUser } from "@/types/auth";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useCurrentUserQuery(initialUser?: AuthUser, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        return await clientGet<AuthUser>("/api/auth/me");
      } catch (err) {
        if (err instanceof ClientHttpError && (err.status === 401 || err.status === 403)) {
          return null;
        }
        throw err;
      }
    },
    initialData: initialUser,
    enabled,
    staleTime: FIVE_MINUTES_MS,
    retry: (failureCount, error) => {
      if (error instanceof ClientHttpError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

