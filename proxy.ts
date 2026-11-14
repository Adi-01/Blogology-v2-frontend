import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAMES } from "@/lib/constants";

const AUTH_ROUTES = ["/login", "/signup", "/register", "/forgot-password"];
const PROTECTED_ROUTES = [
  "/for-you-page",
  "/bookmarks",
  "/dashboard",
  "/profile",
  "/write",
  "/onboarding",
];

function matchesRoutePrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

  const isAuthPage = matchesRoutePrefix(pathname, AUTH_ROUTES);
  const isProtectedPage = matchesRoutePrefix(pathname, PROTECTED_ROUTES);

  if (!sessionToken && isProtectedPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && isAuthPage) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const destination =
      callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/for-you-page";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
