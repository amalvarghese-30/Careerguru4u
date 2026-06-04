// app/api/solutions/bookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
    try {
        const { solutionId } = await req.json();

        const token = req.headers.get("authorization")?.replace("Bearer ", "")
            || req.cookies.get("cg-auth-token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Login required" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const userId = decoded.userId;

        const client = await clientPromise;
        const db = client.db("career_guru");

        await db.collection("user_progress").updateOne(
            { userId },
            { $addToSet: { bookmarks: solutionId }, $set: { updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}