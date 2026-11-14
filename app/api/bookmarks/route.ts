import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  return proxyBackendGet("/api/v1/bookmarks", {
    requireAuth: true,
    params: {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
}
