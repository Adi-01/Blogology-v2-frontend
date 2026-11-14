import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/api/proxy";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return proxyBackend(`/api/v1/posts/${encodeURIComponent(id)}/view`, {
    method: "POST",
    requireAuth: false,
  });
}
