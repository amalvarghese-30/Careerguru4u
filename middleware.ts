import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const roleHierarchy: Record<string, number> = {
  student: 1,
  counsellor: 2,
  admin: 3,
  super_admin: 4,
};

const PUBLIC_API_ROUTES = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify",
  "/api/contact",
  "/api/leads",
  "/api/solutions",
  "/api/colleges",
  "/api/scholarships",
  "/api/blog",
  "/api/careers",
  "/api/mcq",
  "/api/textbooks",
  "/api/exam/patterns",
  "/api/exam/info",
  "/api/academic",
  "/api/public",
  "/api/site-settings",
]);

const PROTECTED_API_PREFIXES = ["/api/admin", "/api/user"];
const PROTECTED_PAGE_PREFIXES = ["/dashboard", "/admin"];

function getToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies.get("cg-auth-token")?.value || null;
}

async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

function isPublicApiRoute(pathname: string): boolean {
  if (PUBLIC_API_ROUTES.has(pathname)) return true;
  for (const publicRoute of PUBLIC_API_ROUTES) {
    if (pathname.startsWith(publicRoute + "/")) return true;
  }
  return false;
}

function requiresAuth(pathname: string): boolean {
  for (const prefix of PROTECTED_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  for (const prefix of PROTECTED_PAGE_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function requiresAdmin(pathname: string): boolean {
  return pathname.startsWith("/api/admin") || pathname.startsWith("/admin");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api") && isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  const token = getToken(req);
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("cg-auth-token");
    return response;
  }

  if (requiresAdmin(pathname)) {
    const level = roleHierarchy[payload.role] || 0;
    if (level < roleHierarchy.admin) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};