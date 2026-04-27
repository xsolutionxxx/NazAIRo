import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET,
);

const AUTH_PAGES = ["/login", "/sign-up"];

const PROTECTED_ROUTES = ["/account", "/dashboard"];

const isAuthPage = (pathname: string) =>
  AUTH_PAGES.some((page) => pathname.startsWith(page));

const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_ACCESS_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const searchParams = req.nextUrl.searchParams;

  // ← пропускаємо перевірку токенів для email confirmation redirect
  if (searchParams.get("emailUpdated") === "true") {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const hasValidAccess = accessToken ? await verifyToken(accessToken) : false;
  const isLoggedIn = hasValidAccess || !!refreshToken;

  if (isAuthPage(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/sign-up",
    "/account/:path*",
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
