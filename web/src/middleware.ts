import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "adminToken";

/**
 * First gate on the dashboard: no session cookie, no admin page.
 *
 * This only checks that a cookie exists - it deliberately does not try to
 * validate the JWT. Middleware runs on every matched request and has no
 * access to the backend's signing key, so verification belongs where it can
 * be done properly: the admin layout calls /auth/me on the server, and
 * Express rejects anything invalid. This just avoids rendering the shell for
 * obviously-signed-out visitors.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);

  if (pathname === "/admin/login") {
    // Already signed in - send them to the dashboard rather than the form.
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL("/admin/login", request.url);
    // Remember where they were headed so login can return them there.
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
