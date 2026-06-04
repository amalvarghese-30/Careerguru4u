import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

const roleHierarchy: Record<string, number> = {
  student: 1,
  counsellor: 2,
  admin: 3,
  super_admin: 4,
};

export function getToken(req: NextRequest): string | null {
  return req.headers.get("authorization")?.replace("Bearer ", "")
    || req.cookies.get("cg-auth-token")?.value
    || null;
}

export function verifyAuth(req: NextRequest): { userId: string; email: string; role: string } | null {
  const token = getToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function requireAdmin(req: NextRequest): { userId: string; email: string; role: string } | null {
  const payload = verifyAuth(req);
  if (!payload) return null;
  const level = roleHierarchy[payload.role] || 0;
  if (level < roleHierarchy["admin"]) return null;
  return payload;
}

export function requireAuth(req: NextRequest): { userId: string; email: string; role: string } | null {
  return verifyAuth(req);
}
