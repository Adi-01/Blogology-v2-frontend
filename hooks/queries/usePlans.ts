"use client";

import { useQuery } from "@tanstack/react-query";
import { clientGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PlanDto } from "@/types/billing";

export function usePlansQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.plans(),
    queryFn: () => clientGet<PlanDto[]>("/api/billing/plans"),
  });
}
