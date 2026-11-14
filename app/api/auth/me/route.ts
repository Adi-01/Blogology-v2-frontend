import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET() {
  return proxyBackendGet("/api/v1/auth/me", {
    requireAuth: true,
  });
}
