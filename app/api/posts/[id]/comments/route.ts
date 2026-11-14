import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = req.nextUrl;

  return proxyBackendGet(
    `/api/v1/posts/${encodeURIComponent(id)}/comments`,
    {
      requireAuth: false,
      params: {
        sort: searchParams.get("sort") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
      },
    }
  );
}
