import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const CSRF_SECRET = new TextEncoder().encode(process.env.CSRF_SECRET || process.env.JWT_SECRET);
const JWT_ISSUER = process.env.JWT_ISSUER || "career-guru";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "career-guru-users";

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

// Methods that require CSRF protection
const CSRF_PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Generate or get CSRF token
 */
async function getCsrfToken(req: NextRequest): Promise<string> {
  let token = req.cookies.get("csrf-token")?.value;
  if (!token) {
    token = await new SignJWT({ ts: Date.now() })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(CSRF_SECRET);
  }
  return token;
}

/**
 * Verify CSRF token from header against cookie
 */
async function verifyCsrfToken(req: NextRequest): Promise<boolean> {
  const cookieToken = req.cookies.get("csrf-token")?.value;
  const headerToken = req.headers.get("x-csrf-token") || req.headers.get("csrf-token");

  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;

  try {
    await jwtVerify(cookieToken, CSRF_SECRET);
    return true;
  } catch {
    return false;
  }
}

function getToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies.get("cg-auth-token")?.value || null;
}

async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
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

  // CSRF protection for state-changing requests
  if (CSRF_PROTECTED_METHODS.has(req.method)) {
    // Skip CSRF for auth endpoints that use credentials
    const isAuthEndpoint = pathname.startsWith("/api/auth/");
    const isPublicMutation = isPublicApiRoute(pathname);

    if (!isAuthEndpoint && !isPublicMutation) {
      const csrfValid = await verifyCsrfToken(req);
      if (!csrfValid) {
        if (pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "Invalid or missing CSRF token" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/login?csrf=invalid", req.url));
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSRF token cookie if not present
  const csrfToken = req.cookies.get("csrf-token")?.value;
  if (!csrfToken) {
    const newToken = await getCsrfToken(req);
    response.cookies.set("csrf-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
  }

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};