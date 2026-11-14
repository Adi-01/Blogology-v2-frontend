import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(_req: NextRequest) {
  return proxyBackendGet("/api/v1/billing/plans", {
    requireAuth: false,
  });
}
