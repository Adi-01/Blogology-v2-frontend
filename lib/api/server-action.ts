import "server-only";
import { cookies } from "next/headers";
import { executeFetch } from "@/lib/api/core";
import { type ApiResponse, type RequestOptions } from "@/lib/api/types";
import { API_BASE_URL, COOKIE_NAMES } from "@/lib/constants";

type MutationMethod = "POST" | "PATCH" | "PUT" | "DELETE";

interface MutateOptions<TBody> extends Omit<RequestOptions, "body"> {
  method?: MutationMethod;
  body?: TBody;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
    Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}`,
  };
}

async function forwardSetCookies(headers?: Headers): Promise<void> {
  if (!headers) return;
  const cookieStore = await cookies();

  const getSetCookieFn = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const rawCookies = typeof getSetCookieFn === "function"
    ? getSetCookieFn.call(headers)
    : [headers.get("set-cookie")].filter(Boolean) as string[];

  for (const cookieStr of rawCookies) {
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameVal, ...attrs] = parts;
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx === -1) continue;

    const name = nameVal.substring(0, eqIdx);
    const value = nameVal.substring(eqIdx + 1);

    const options: {
      path?: string;
      maxAge?: number;
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
    } = {};

    for (const attr of attrs) {
      const [attrKey, attrVal] = attr.split("=");
      const lower = attrKey.toLowerCase();
      if (lower === "path") options.path = attrVal;
      else if (lower === "max-age") options.maxAge = parseInt(attrVal, 10);
      else if (lower === "httponly") options.httpOnly = true;
      else if (lower === "secure") options.secure = true;
      else if (lower === "samesite") {
        const s = (attrVal || "").toLowerCase();
        if (s === "lax" || s === "strict" || s === "none") {
          options.sameSite = s;
        }
      }
    }

    cookieStore.set(name, value, options);
  }
}

export const apiServerAction = {
  mutate: async <TData, TBody = unknown>(
    endpoint: string,
    options?: MutateOptions<TBody>
  ): Promise<ApiResponse<TData>> => {
    const { method = "POST", body, headers, ...rest } = options || {};
    const authHeaders = await getAuthHeaders();

    const response = await executeFetch<TData>(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { ...authHeaders, ...headers },
    });

    if (response.headers) {
      await forwardSetCookies(response.headers);
    }

    return response;
  },
};
