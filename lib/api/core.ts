import { redirect } from "next/navigation";
import { ApiError, type ApiResponse, type RequestOptions } from "@/lib/api/types";
export async function executeFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...init } = options;

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val));
    });
    const queryString = searchParams.toString();
    if (queryString) finalUrl += `?${queryString}`;
  }

  try {
    const response = await fetch(finalUrl, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        body?.error?.message ||
        body?.message ||
        response.statusText ||
        "Request failed";
      const errorCode = body?.error?.code || body?.code;
      const errorDetails = body?.error?.details || body?.details;

      // Centralized session expiration & account blocking handling for authenticated requests
      // Do NOT redirect if the request itself is an auth attempt (e.g. login, register)
      const isAuthAttempt =
        url.includes("/api/v1/auth/login") ||
        url.includes("/api/v1/auth/register") ||
        url.includes("/api/v1/auth/forgot-password") ||
        url.includes("/api/v1/auth/reset-password");

      if (!isAuthAttempt) {
        if (response.status === 401) {
          redirect("/api/auth/logout?error=session_expired");
        }
        if (response.status === 403 && errorCode === "USER_BLOCKED") {
          redirect("/api/auth/logout?error=account_blocked");
        }
      }

      return {
        ok: false,
        data: null,
        error: new ApiError(
          response.status,
          errorMessage,
          errorCode,
          errorDetails
        ),
        headers: response.headers,
      };
    }

    return {
      ok: true,
      data: (body?.data ?? body) as T,
      error: null,
      headers: response.headers,
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    const message = err instanceof Error ? err.message : "Internal Network Error";
    return {
      ok: false,
      data: null,
      error: new ApiError(500, message),
    };
  }
}

