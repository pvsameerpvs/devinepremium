import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "devinepremium-admin-session";
const LOGIN_PATH = "/login";
const LOGIN_REDIRECT_PATH = "/login/";
const DASHBOARD_REDIRECT_PATH = "/dashboard/";

interface AdminCookieSession {
  token?: string;
  user?: {
    role?: string;
  };
}

function readAdminSession(request: NextRequest): AdminCookieSession | null {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(sessionCookie.value)) as AdminCookieSession;
  } catch {
    return null;
  }
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function proxy(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);
  const session = readAdminSession(request);

  const isLoggedIn = Boolean(session?.token);
  const isAdmin = session?.user?.role === "admin";
  const isLoginPage = pathname === LOGIN_PATH;

  if (!isLoggedIn && !isLoginPage) {
    const url = new URL(LOGIN_REDIRECT_PATH, request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && !isAdmin && !isLoginPage) {
    const response = NextResponse.redirect(
      new URL(`${LOGIN_REDIRECT_PATH}?error=unauthorized`, request.url),
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (isLoggedIn && isAdmin && isLoginPage) {
    return NextResponse.redirect(new URL(DASHBOARD_REDIRECT_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
