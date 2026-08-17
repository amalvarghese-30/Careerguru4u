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

        const limit = Math.min(parseInt(searchParams.get("limit") || "500"), 500);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const skip = (page - 1) * limit;

        const [solutions, totalCount] = await Promise.all([
            db.collection("solutions").find(query).skip(skip).limit(limit).toArray(),
            db.collection("solutions").countDocuments(query),
        ]);

        // Bulk-fetch user progress in a single query (avoids N+1 round-trips)
        let progressMap: Record<string, number> = {};
        if (userId && solutions.length > 0) {
            const uniqueCombos: { board: unknown; class: unknown; subject: unknown; chapter: unknown }[] = [];
            const seen = new Set<string>();
            for (const s of solutions as Record<string, unknown>[]) {
                const key = `${s.board}|${s.class}|${s.subject}|${s.chapter}`;
                if (seen.has(key)) continue;
                seen.add(key);
                uniqueCombos.push({ board: s.board, class: s.class, subject: s.subject, chapter: s.chapter });
            }

            const progressList = await db.collection("user_progress").find({
                userId,
                $or: uniqueCombos.map((c) => ({
                    board: c.board,
                    class: c.class,
                    subject: c.subject,
                    chapter: c.chapter,
                })),
            }).toArray();

            for (const p of progressList as Record<string, unknown>[]) {
                const key = `${p.board}|${p.class}|${p.subject}|${p.chapter}`;
                progressMap[key] = (p.freeSolutionsUsed as number) || 0;
            }
        }

        // Apply login gate logic in-memory
        const solutionsWithAccess = (solutions as Record<string, unknown>[]).map((solution) => {
            const solutionData = { ...solution };

            if (solution.isFree) {
                solutionData.canAccess = true;
            } else if (userId) {
                const key = `${solution.board}|${solution.class}|${solution.subject}|${solution.chapter}`;
                const freeUsed = progressMap[key] || 0;
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
        });

        return NextResponse.json({ solutions: solutionsWithAccess, totalCount, page, limit });

    } catch (error) {
        console.error("Solutions API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}