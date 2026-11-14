import { executeFetch } from "@/lib/api/core";
import { apiServerAction } from "@/lib/api/server-action";
import { API_BASE_URL, CACHE_TAGS } from "@/lib/constants";
import { cacheTag, cacheLife } from "next/cache";
import type { PlanDto } from "@/types/billing";

async function fetchPlansCached(): Promise<PlanDto[]> {
  "use cache";
  cacheTag(CACHE_TAGS.billing?.plans?.() ?? "billing:plans");
  cacheLife("hours");

  const res = await executeFetch<PlanDto[]>(`${API_BASE_URL}/api/v1/billing/plans`, {
    method: "GET",
  });

  return res.ok ? res.data : [];
}

export const billingService = {
  getPlans: async (): Promise<PlanDto[]> => {
    return fetchPlansCached();
  },

  createCheckoutSession: async (planName: "PRO"): Promise<{ url: string } | null> => {
    const res = await apiServerAction.mutate<{ url: string }, { planName: string }>(
      "/api/v1/billing/checkout-session",
      {
        method: "POST",
        body: { planName },
      }
    );

    return res.ok ? res.data : null;
  },
};
