import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/db/mongodb";
import { rateLimitLogin, clearLoginAttempts } from "@/lib/rate-limit-redis";
import { getClientIp } from "@/lib/rate-limit";
import { securityLogger } from "@/lib/logger";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ISSUER = process.env.JWT_ISSUER || "career-guru";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "career-guru-users";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing email/phone or password" }, { status: 400 });
    }

    // Rate limit by identifier (email/phone) AND IP
    const clientIp = getClientIp(req);
    const rateLimitIdentifier = `${identifier}:${clientIp}`;

    const rateLimitResult = await rateLimitLogin(rateLimitIdentifier);
    if (!rateLimitResult.ok) {
      const response = NextResponse.json(
        {
          error: rateLimitResult.lockedOut
            ? `Too many failed attempts. Account locked for ${Math.ceil(rateLimitResult.retryAfterSec / 60)} minutes.`
            : "Too many login attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfterSec,
        },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(rateLimitResult.retryAfterSec));
      if (rateLimitResult.lockedOut && rateLimitResult.lockoutUntil) {
        response.headers.set("X-Lockout-Until", String(rateLimitResult.lockoutUntil));
      }
      return response;
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const user = await db.collection("users").findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Block suspended / inactive accounts from logging in
    if (user.status === "inactive" || user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account is not active. Please contact support." },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role || "student",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    );

    // Clear login attempts on successful login
    await clearLoginAttempts(rateLimitIdentifier);

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        role: userWithoutPassword.role || "student",
      },
    });

    response.cookies.set("cg-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    securityLogger.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}