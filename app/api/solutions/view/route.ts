// app/api/solutions/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
    try {
        const { solutionId, board, class: classNum, subject, chapter } = await req.json();

        const token = req.headers.get("authorization")?.replace("Bearer ", "")
            || req.cookies.get("cg-auth-token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Login required to view solutions" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const userId = decoded.userId;

        const client = await clientPromise;
        const db = client.db("career_guru");

        // Get solution
        const solution = await db.collection("solutions").findOne({ _id: new ObjectId(solutionId) });
        if (!solution) {
            return NextResponse.json({ error: "Solution not found" }, { status: 404 });
        }

        // Check if free
        if (solution.isFree) {
            // Increment view count
            await db.collection("solutions").updateOne(
                { _id: new ObjectId(solutionId) },
                { $inc: { viewCount: 1 } }
            );

            return NextResponse.json({ solution, isNewlyUnlocked: false });
        }

        // Check user progress
        let progress = await db.collection("user_progress").findOne({
            userId,
            board: solution.board,
            class: solution.class,
            subject: solution.subject,
            chapter: solution.chapter
        });

        const freeUsed = progress?.freeSolutionsUsed || 0;

        if (freeUsed >= 2) {
            return NextResponse.json({
                error: "You've used your 2 free solutions for this chapter. Please upgrade to view more.",
                requiresUpgrade: true
            }, { status: 403 });
        }

        // Track this solution view
        if (!progress) {
            await db.collection("user_progress").insertOne({
                userId,
                board: solution.board,
                class: solution.class,
                subject: solution.subject,
                chapter: solution.chapter,
                viewedSolutions: [solutionId],
                freeSolutionsUsed: 1,
                bookmarks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await db.collection("user_progress").updateOne(
                { _id: progress._id },
                {
                    $addToSet: { viewedSolutions: solutionId },
                    $inc: { freeSolutionsUsed: 1 },
                    $set: { updatedAt: new Date() }
                }
            );
        }

        // Increment solution view count
        await db.collection("solutions").updateOne(
            { _id: new ObjectId(solutionId) },
            { $inc: { viewCount: 1, helpfulCount: 0 } }
        );

        return NextResponse.json({
            solution,
            isNewlyUnlocked: true,
            remainingFree: 1 - freeUsed
        });

    } catch (error) {
        console.error("View solution error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}