import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get("cg-auth-token")?.value
            || req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("career_guru");

        const resume = await db.collection("resumes").findOne({ _id: new ObjectId(id), userId });
        if (!resume) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        return NextResponse.json({ resume });
    } catch (error) {
        console.error("Resume [id] GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get("cg-auth-token")?.value
            || req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("career_guru");

        const result = await db.collection("resumes").deleteOne({ _id: new ObjectId(id), userId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Resume [id] DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
