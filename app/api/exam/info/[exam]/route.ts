import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ exam: string }> }
) {
    try {
        const { exam } = await params;
        const client = await clientPromise;
        const db = client.db("career_guru");

        const pattern = await db.collection("exam_patterns").findOne({ examType: exam });

        if (!pattern) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const questionCount = await db.collection("mcq_questions").countDocuments({ examType: exam });

        return NextResponse.json({ pattern, questionCount });
    } catch (error) {
        console.error("Exam info GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
