import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("career_guru");

        const patterns = await db.collection("exam_patterns")
            .find({})
            .project({ syllabus: 0 })
            .sort({ displayName: 1 })
            .toArray();

        return NextResponse.json({ patterns });
    } catch (error) {
        console.error("Exam patterns GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin(req);
        if (!admin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await req.json();
        const { examType, displayName, description, category, subjects, totalMarks, totalQuestions, timeLimit, markingScheme, eligibility, examDate, icon, session } = body;

        if (!examType || !displayName) {
            return NextResponse.json({ error: "examType and displayName are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        await db.collection("exam_patterns").updateOne(
            { examType },
            {
                $set: {
                    examType,
                    displayName,
                    description,
                    category: category || "other",
                    subjects: subjects || [],
                    totalMarks: totalMarks || 0,
                    totalQuestions: totalQuestions || 0,
                    timeLimit: timeLimit || 180,
                    markingScheme: markingScheme || { correct: 4, incorrect: -1, unattempted: 0 },
                    eligibility: eligibility || "",
                    examDate: examDate || "",
                    icon: icon || "GraduationCap",
                    session: session || "",
                    updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Exam patterns POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
