import { NextRequest, NextResponse } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  if (type !== "posts" && type !== "users") {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_SEARCH_TYPE", message: "Search type must be 'posts' or 'users'." } },
      { status: 400 }
    );
  }

  return proxyBackendGet(`/api/v1/search/${type}`, {
    requireAuth: false,
    params: {
      q: searchParams.get("q") ?? "",
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
}
