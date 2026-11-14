import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  return proxyBackendGet("/api/v1/posts/mine", {
    requireAuth: true,
    params: {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    },
  });
}
