import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, COOKIE_NAMES } from "@/lib/constants";

interface ProxyOptions {
  method?: "GET" | "POST";
  requireAuth?: boolean;
  params?: Record<string, string | number | undefined>;
}

/**
 * Proxies a GET request from a Next.js Route Handler to Express,
 * forwarding the HttpOnly session cookie (when present) and preserving the
 * upstream status code and JSON payload.
 */
export async function proxyBackend(
  backendPath: string,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const { method = "GET", requireAuth = true, params } = options;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

  if (requireAuth && !token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const url = new URL(`${API_BASE_URL}${backendPath}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  try {
    const backendRes = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
              Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
            }
          : {}),
      },
      cache: "no-store",
    });

    const body = await backendRes.json().catch(() => null);
    return NextResponse.json(body, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UPSTREAM_ERROR", message: "Unable to reach backend service." } },
      { status: 502 }
    );
  }
}

export function proxyBackendGet(
  backendPath: string,
  options: Omit<ProxyOptions, "method"> = {}
): Promise<NextResponse> {
  return proxyBackend(backendPath, { ...options, method: "GET" });
}
