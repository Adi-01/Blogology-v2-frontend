import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAMES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN);

  const errorParam = request.nextUrl.searchParams.get("error");
  const redirectUrl = new URL(
    errorParam ? `/login?error=${encodeURIComponent(errorParam)}` : "/login",
    request.url
  );

  return NextResponse.redirect(redirectUrl);
}

