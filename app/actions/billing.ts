"use server";

import { billingService } from "@/lib/services/billing.services";

export async function createCheckoutSessionAction(
  planName: "PRO" = "PRO"
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const result = await billingService.createCheckoutSession(planName);

    if (!result?.url) {
      return {
        success: false,
        error: "Unable to create checkout session. Please try again.",
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}
