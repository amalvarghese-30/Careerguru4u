import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { answers, board, class: classNum, subject, chapter, timeTaken, examType, negativeMarking } = body;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ error: "Answers array is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        const questionIds = answers.map((a: any) => new ObjectId(a.questionId));
        const questions = await db.collection("mcq_questions")
            .find({ _id: { $in: questionIds } })
            .toArray();

        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unattempted = 0;
        const results: any[] = [];

        for (const answer of answers) {
            if (answer.selectedOption === undefined || answer.selectedOption === null || answer.selectedOption < 0) {
                unattempted++;
                results.push({
                    questionId: answer.questionId,
                    selectedOption: -1,
                    isCorrect: false,
                    correctOptionIndex: questionMap.get(answer.questionId)?.correctOptionIndex,
                    explanation: questionMap.get(answer.questionId)?.explanation,
                });
                continue;
            }

            const question = questionMap.get(answer.questionId);
            const isCorrect = question && question.correctOptionIndex === answer.selectedOption;

            if (isCorrect) correctAnswers++;
            else wrongAnswers++;

            results.push({
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                correctOptionIndex: question?.correctOptionIndex,
                explanation: question?.explanation,
            });
        }

        const totalQuestions = answers.length;
        let score: number;
        let negativeMarks = 0;

        if (negativeMarking) {
            const pattern = await db.collection("exam_patterns").findOne({ examType });
            if (pattern) {
                const correctWeight = pattern.markingScheme.correct || 4;
                const incorrectPenalty = Math.abs(pattern.markingScheme.incorrect) || 1;
                const maxScore = totalQuestions * correctWeight;
                const rawScore = correctAnswers * correctWeight - wrongAnswers * incorrectPenalty;
                negativeMarks = wrongAnswers * incorrectPenalty;
                score = Math.max(0, Math.round((rawScore / maxScore) * 100));
            } else {
                score = Math.round((correctAnswers / totalQuestions) * 100);
                negativeMarks = wrongAnswers;
            }
        } else {
            score = Math.round((correctAnswers / totalQuestions) * 100);
        }

        await db.collection("mock_test_attempts").insertOne({
            userId,
            board: board || "",
            class: classNum || 0,
            subject: subject || "",
            chapter: chapter || "",
            examType: examType || undefined,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            unattempted,
            score,
            timeTaken: timeTaken || 0,
            negativeMarking: negativeMarking || false,
            negativeMarks: negativeMarking ? negativeMarks : undefined,
            answers: results,
            attemptedAt: new Date(),
        });

        return NextResponse.json({
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            unattempted,
            score,
            negativeMarks: negativeMarking ? negativeMarks : undefined,
            results,
        });
    } catch (error) {
        console.error("MCQ Submit API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
