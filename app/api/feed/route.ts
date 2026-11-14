import { NextRequest, NextResponse } from "next/server";
import { proxyBackendGet } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  if (type !== "for-you" && type !== "explore") {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_FEED_TYPE", message: "Feed type must be 'for-you' or 'explore'." } },
      { status: 400 }
    );
  }

  return proxyBackendGet(`/api/v1/feed/${type}`, {
    requireAuth: type === "for-you",
    params: {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
}
