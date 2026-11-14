"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/providers/user-provider";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { UserSessionView } from "@/types/auth";

export function useSessionsQuery(enabled = true) {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.sessions(user?.id ?? ""),
    queryFn: () => clientGet<UserSessionView[]>("/api/auth/sessions"),
    enabled: Boolean(user) && enabled,
  });
}
