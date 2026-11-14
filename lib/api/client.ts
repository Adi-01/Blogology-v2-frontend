export class ClientHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function clientGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.pathname + url.search, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      res.statusText ||
      "Request failed";
    throw new ClientHttpError(res.status, message);
  }

  return (body?.data ?? body) as T;
}
