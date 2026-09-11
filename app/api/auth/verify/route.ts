// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || "career-guru";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "career-guru-users";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "")
            || req.cookies.get("cg-auth-token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No token provided" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { userId: string };

        const client = await clientPromise;
        const db = client.db("career_guru");

        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });

    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}