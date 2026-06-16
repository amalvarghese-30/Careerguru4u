import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";
import { resumeSchema } from "@/lib/validations";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
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

        const client = await clientPromise;
        const db = client.db("career_guru");

        const resumes = await db.collection("resumes")
            .find({ userId })
            .sort({ updatedAt: -1 })
            .toArray();

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error("Resume GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const parsed = resumeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        const { _id, ...rest } = body;

        const resumeDoc = {
            ...rest,
            userId,
            updatedAt: new Date(),
        };

        if (_id) {
            await db.collection("resumes").updateOne(
                { _id, userId },
                { $set: resumeDoc }
            );
            const updated = await db.collection("resumes").findOne({ _id, userId });
            return NextResponse.json({ resume: updated });
        } else {
            const doc = { ...resumeDoc, createdAt: new Date() };
            const result = await db.collection("resumes").insertOne(doc);
            const created = await db.collection("resumes").findOne({ _id: result.insertedId });
            return NextResponse.json({ resume: created }, { status: 201 });
        }
    } catch (error) {
        console.error("Resume POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
