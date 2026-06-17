import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET,
);

const AUTH_PAGES = ["/login", "/sign-up"];

const PROTECTED_ROUTES = ["/account", "/dashboard"];
const ADMIN_ROUTES = ["/admin"];

const isAuthPage = (pathname: string) =>
  AUTH_PAGES.some((page) => pathname.startsWith(page));

const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

const isAdminRoute = (pathname: string) =>
  ADMIN_ROUTES.some((route) => pathname.startsWith(route));

async function verifyToken(token: string): Promise<{ valid: boolean; role?: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
    return { valid: true, role: payload.role as string | undefined };
  } catch {
    return { valid: false };
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const searchParams = req.nextUrl.searchParams;

  if (searchParams.get("emailUpdated") === "true") {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const tokenResult = accessToken ? await verifyToken(accessToken) : { valid: false };
  const isLoggedIn = tokenResult.valid || !!refreshToken;
  const isAdmin = tokenResult.role === "ADMIN";

  if (isAuthPage(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/sign-up",
    "/account/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
