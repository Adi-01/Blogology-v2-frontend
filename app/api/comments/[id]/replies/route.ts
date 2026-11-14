import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = req.nextUrl;

  return proxyBackendGet(
    `/api/v1/comments/${encodeURIComponent(id)}/replies`,
    {
      requireAuth: false,
      params: {
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
      },
    }
  );
}
