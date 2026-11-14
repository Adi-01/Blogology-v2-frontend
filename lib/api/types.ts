export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiResponse<T> =
  | { ok: true; data: T; error: null; headers?: Headers }
  | { ok: false; data: null; error: ApiError; headers?: Headers };

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}
