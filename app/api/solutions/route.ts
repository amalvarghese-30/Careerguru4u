// app/api/solutions/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const board = searchParams.get("board");
        const classNum = searchParams.get("class");
        const subject = searchParams.get("subject");
        const chapter = searchParams.get("chapter");

        const token = req.headers.get("authorization")?.replace("Bearer ", "")
            || req.cookies.get("cg-auth-token")?.value;
        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                userId = decoded.userId;
            } catch (e) { }
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        // Build query
        const query: any = {};
        if (board) query.board = board;
        if (classNum) query.class = parseInt(classNum);
        if (subject) query.subject = subject;
        if (chapter) query.chapter = chapter;

        const solutions = await db.collection("solutions").find(query).limit(50).toArray();

        // Apply login gate logic
        const solutionsWithAccess = await Promise.all(solutions.map(async (solution: Record<string, unknown>) => {
            const solutionData = { ...solution };

            // Check if user has access
            if (solution.isFree) {
                solutionData.canAccess = true;
            } else if (userId) {
                // Check user's free solution usage for this chapter
                const progress = await db.collection("user_progress").findOne({
                    userId,
                    board: solution.board,
                    class: solution.class,
                    subject: solution.subject,
                    chapter: solution.chapter
                });

                const freeUsed = progress?.freeSolutionsUsed || 0;
                solutionData.canAccess = freeUsed < 2;
                solutionData.freeRemaining = Math.max(0, 2 - freeUsed);
            } else {
                solutionData.canAccess = false;
            }

            // Don't send full answer if cannot access
            if (!solutionData.canAccess) {
                solutionData.answer = "LOGIN_REQUIRED";
            }

            return solutionData;
        }));

        return NextResponse.json({ solutions: solutionsWithAccess });

    } catch (error) {
        console.error("Solutions API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}