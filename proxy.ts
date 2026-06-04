import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

const roleHierarchy: Record<string, number> = {
  student: 1,
  counsellor: 2,
  admin: 3,
  super_admin: 4,
};

function hasMinRole(userRole: string | undefined, requiredRole: string): boolean {
  if (!userRole) return false;
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

const apiProtection: Record<string, string[]> = {
  "/api/admin": ["admin", "super_admin"],
  "/api/counselling/manage": ["counsellor", "admin", "super_admin"],
  "/api/solutions/bookmark": ["student", "counsellor", "admin", "super_admin"],
  "/api/solutions/view": ["student", "counsellor", "admin", "super_admin"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes — verify JWT and role
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("cg-auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const payload = await verifyToken(token);
    if (!payload || !hasMinRole(payload.role, "admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Dashboard requires auth
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("cg-auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protected API routes — verify JWT and role
  for (const [prefix, roles] of Object.entries(apiProtection)) {
    if (pathname.startsWith(prefix)) {
      const token = req.cookies.get("cg-auth-token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const payload = await verifyToken(token);
      if (!payload || !roles.includes(payload.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/counselling/manage/:path*",
    "/api/solutions/bookmark/:path*",
    "/api/solutions/view/:path*",
  ],
};
