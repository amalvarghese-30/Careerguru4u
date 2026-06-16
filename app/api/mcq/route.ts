import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const board = searchParams.get("board") || "";
        const classNum = searchParams.get("class");
        const subject = searchParams.get("subject");
        const chapter = searchParams.get("chapter");
        const examType = searchParams.get("examType") || "";
        const difficulty = searchParams.get("difficulty") || "";
        const limit = parseInt(searchParams.get("limit") || "20");

        const client = await clientPromise;
        const db = client.db("career_guru");

        const query: any = {};
        if (board) query.board = board;
        if (classNum) query.class = parseInt(classNum);
        if (subject) query.subject = subject;
        if (chapter) query.chapter = chapter;
        if (examType) query.examType = examType;
        if (difficulty) query.difficulty = difficulty;

        const questions = await db.collection("mcq_questions")
            .find(query)
            .limit(Math.min(limit, 50))
            .toArray();

        const sanitized = questions.map((q: Record<string, unknown>) => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            board: q.board,
            class: q.class,
            subject: q.subject,
            chapter: q.chapter,
            examType: q.examType,
            difficulty: q.difficulty,
        }));

        return NextResponse.json({ questions: sanitized });
    } catch (error) {
        console.error("MCQ API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        await db.collection("mcq_questions").deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("MCQ DELETE API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
