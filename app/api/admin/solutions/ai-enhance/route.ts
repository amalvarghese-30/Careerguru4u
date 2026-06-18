import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { enhanceSolution } from "@/lib/ai/enhancer";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { solutionId, accept } = body;

    if (!solutionId) {
      return NextResponse.json({ error: "solutionId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const existing = await db.collection("solutions").findOne({ _id: new ObjectId(solutionId) });

    if (!existing) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    // Determine content to enhance — prefer block content, fall back to string fields
    const questionBlocks: ContentBlock[] = existing.questionBlocks || [];
    const solutionSteps: SolutionStep[] = existing.solutionSteps || [];

    if (questionBlocks.length === 0 && solutionSteps.length === 0) {
      // Convert legacy string fields to basic blocks
      const legacyQuestion: ContentBlock[] = existing.question
        ? [{ type: "paragraph", id: "legacy_q", content: existing.question }]
        : [];
      const legacySolution: SolutionStep[] = existing.answer
        ? [{ stepNumber: 1, blocks: [{ type: "paragraph", id: "legacy_a", content: existing.answer }] }]
        : [];

      if (legacyQuestion.length === 0 && legacySolution.length === 0) {
        return NextResponse.json({ error: "Solution has no content to enhance" }, { status: 400 });
      }

      try {
        const result = await enhanceSolution(legacyQuestion, legacySolution);
        return NextResponse.json({ enhanced: result });
      } catch (err) {
        console.error("AI enhancement error:", err);
        return NextResponse.json(
          { error: `AI enhancement failed: ${(err as Error).message}` },
          { status: 500 }
        );
      }
    }

    // If accept mode, persist the enhanced data
    if (accept) {
      const enhancedQuestion = body.enhancedQuestion || [];
      const enhancedSolution = body.enhancedSolution || [];
      const enhancedQuestionType = body.enhancedQuestionType || undefined;
      const enhancedDifficulty = body.enhancedDifficulty || undefined;
      const enhancedHints = body.enhancedHints || undefined;

      const update: Record<string, unknown> = {
        aiEnhancedData: {
          question: enhancedQuestion,
          solution: enhancedSolution,
          questionType: enhancedQuestionType,
          difficulty: enhancedDifficulty,
          hints: enhancedHints,
        },
        sourceType: "ai-enhanced",
        version: (existing.version || 1) + 1,
        updatedAt: new Date(),
      };

      if (!existing.originalData) {
        update.originalData = {
          question: existing.questionBlocks || existing.question,
          solution: existing.solutionSteps || existing.answer,
        };
      }

      await db.collection("solutions").updateOne({ _id: new ObjectId(solutionId) }, { $set: update });

      await logAudit({
        action: "AI_ENHANCE",
        collection: "solutions",
        documentId: solutionId,
        performedBy: admin.userId,
        performedByEmail: admin.email,
        changes: { enhancedQuestionType, enhancedDifficulty, version: update.version },
      });

      return NextResponse.json({ success: true, version: update.version });
    }

    // Preview mode: run enhancement and return result
    try {
      const result = await enhanceSolution(questionBlocks, solutionSteps);
      return NextResponse.json({ enhanced: result });
    } catch (err) {
      console.error("AI enhancement error:", err);
      return NextResponse.json(
        { error: `AI enhancement failed: ${(err as Error).message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("AI enhance API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
