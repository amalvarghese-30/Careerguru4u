import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("cg-auth-token")?.value
            || req.headers.get("authorization")?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const examType = searchParams.get("examType") || "";

        const client = await clientPromise;
        const db = client.db("career_guru");

        const query: any = { userId, examType: { $exists: true, $ne: null } };
        if (examType) query.examType = examType;

        const attempts = await db.collection("mock_test_attempts")
            .find(query)
            .sort({ attemptedAt: -1 })
            .toArray();

        const totalAttempts = attempts.length;
        const bestScore = attempts.reduce((max, a) => Math.max(max, a.score || 0), 0);
        const avgScore = totalAttempts > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts)
            : 0;

        const scoreProgression = attempts
            .slice()
            .reverse()
            .map((a, i) => ({
                attempt: i + 1,
                score: a.score,
                subject: a.subject,
                date: a.attemptedAt,
            }));

        const subjectPerformance: Record<string, { total: number; count: number; best: number }> = {};
        for (const a of attempts) {
            const subj = a.subject || "General";
            if (!subjectPerformance[subj]) {
                subjectPerformance[subj] = { total: 0, count: 0, best: 0 };
            }
            subjectPerformance[subj].total += a.score || 0;
            subjectPerformance[subj].count += 1;
            subjectPerformance[subj].best = Math.max(subjectPerformance[subj].best, a.score || 0);
        }

        const subjectBreakdown = Object.entries(subjectPerformance).map(([subject, data]) => ({
            subject,
            avgScore: Math.round(data.total / data.count),
            bestScore: data.best,
            attempts: data.count,
        }));

        const weakAreas = subjectBreakdown
            .filter(s => s.avgScore < 50)
            .map(s => s.subject);

        const recentAttempts = attempts.slice(0, 10).map(a => ({
            id: a._id,
            examType: a.examType,
            subject: a.subject,
            score: a.score,
            totalQuestions: a.totalQuestions,
            correctAnswers: a.correctAnswers,
            wrongAnswers: a.wrongAnswers,
            timeTaken: a.timeTaken,
            negativeMarks: a.negativeMarks,
            attemptedAt: a.attemptedAt,
        }));

        return NextResponse.json({
            stats: { totalAttempts, bestScore, avgScore, weakAreas },
            scoreProgression,
            subjectBreakdown,
            recentAttempts,
            allAttempts: attempts.length,
        });
    } catch (error) {
        console.error("Exam analytics GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
