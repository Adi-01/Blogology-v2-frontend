import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;

  return proxyBackendGet(`/api/v1/users/${encodeURIComponent(id)}/posts`, {
    requireAuth: false,
    params: {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
}
