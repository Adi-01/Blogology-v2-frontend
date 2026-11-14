import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return proxyBackendGet(`/api/v1/posts/${encodeURIComponent(id)}`, {
    requireAuth: false,
  });
}
