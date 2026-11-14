import { NextRequest } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyBackendGet(`/api/v1/users/${id}/relationship`, {
    requireAuth: true,
  });
}
