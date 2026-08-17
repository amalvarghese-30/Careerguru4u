// app/api/mcq/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function extractAnswerText(answer: string, maxLen: number = 120): string {
  // Strip answer/ans/solution: prefixes
  const cleaned = answer
    .replace(/^(answer|ans|solution)[:\s-]*/i, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Take first meaningful sentence
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return cleaned.substring(0, maxLen);

  const first = sentences[0].trim();
  if (first.length <= maxLen) return first;
  return first.substring(0, maxLen) + "...";
}

function estimateDifficulty(question: string, answer: string): "easy" | "medium" | "hard" {
  const combinedLength = question.length + answer.length;
  if (combinedLength < 100) return "easy";
  if (combinedLength < 300) return "medium";
  return "hard";
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`mcq-generate:${getClientIp(req)}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const { board, class: classNum, subject, chapter, chapters, limit = 10, examType } = body;

    // Validate required params
    if (!examType && (!board || !classNum || !subject)) {
      return NextResponse.json(
        { error: "board, class, and subject are required (or examType + subject)" },
        { status: 400 }
      );
    }
    if (examType && !subject) {
      return NextResponse.json({ error: "subject is required with examType" }, { status: 400 });
    }

    // Resolve chapters: single chapter or comma-separated list
    let chapterList: string[] = [];
    if (chapters) {
      chapterList = chapters.split(",").map((c: string) => c.trim()).filter(Boolean);
    } else if (chapter) {
      chapterList = [chapter];
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Build solution query
    const solutionQuery: any = {};
    if (examType) {
      solutionQuery.subject = subject;
    } else {
      solutionQuery.board = board;
      solutionQuery.class = parseInt(classNum);
      solutionQuery.subject = subject;
    }
    if (chapterList.length === 1) {
      solutionQuery.chapter = chapterList[0];
    } else if (chapterList.length > 1) {
      solutionQuery.chapter = { $in: chapterList };
    }

    // Fetch solutions for the selected scope
    const solutions = await db.collection("solutions")
      .find(solutionQuery)
      .limit(Math.min(limit * 3, 90)) // Fetch more to build good distractor pool
      .toArray();

    if (solutions.length < 5) {
      return NextResponse.json(
        { error: "Not enough content. Select more chapters or a different subject." },
        { status: 400 }
      );
    }

    // Build same-chapter distractor pool for each question
    // For a given solution, pool distractors from OTHER solutions in the SAME chapter
    // If same-chapter pool is too small, fall back to same-subject pool

    // Pre-group solutions by chapter for efficient pooling
    const byChapter: Record<string, string[]> = {};
    for (const sol of solutions) {
      const ch = sol.chapter || "unknown";
      if (!byChapter[ch]) byChapter[ch] = [];
      byChapter[ch].push(extractAnswerText(sol.answer));
    }

    // Build subject-wide fallback pool (all answers across all chapters)
    const subjectPool = solutions.map(sol => extractAnswerText(sol.answer));

    const generated: any[] = [];
    const maxToGenerate = Math.min(limit, 30);
    const solutionsToUse = solutions.slice(0, maxToGenerate);

    for (const sol of solutionsToUse) {
      const correctAnswer = extractAnswerText(sol.answer);

      // Pool distractors from the same chapter (excluding this solution's answer)
      const ch = sol.chapter || "unknown";
      const chapterPool = (byChapter[ch] || []).filter(a => a !== correctAnswer);

      let distractorPool = chapterPool;
      // Fallback: if chapter pool has fewer than 3 unique distractors, use subject-wide pool
      if (new Set(distractorPool).size < 3) {
        distractorPool = subjectPool.filter(a => a !== correctAnswer);
      }

      // Pick 3 unique random distractors
      const uniquePool = [...new Set(distractorPool)];

      // Shuffle the pool
      for (let i = uniquePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
      }

      const distractors = uniquePool.slice(0, 3);

      // If we still don't have 3 distractors, pad with generic options
      while (distractors.length < 3) {
        distractors.push("None of the above");
      }

      // Combine and shuffle all 4 options
      const options = [correctAnswer, ...distractors];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(correctAnswer);

      const mcq: any = {
        questionText: sol.question,
        options,
        correctOptionIndex: correctIndex,
        explanation: sol.answer,
        subject: sol.subject,
        chapter: sol.chapter,
        sourceSolutionId: sol._id?.toString(),
        difficulty: estimateDifficulty(sol.question, sol.answer),
        createdAt: new Date(),
      };

      if (examType) {
        mcq.examType = examType;
      } else {
        mcq.board = sol.board;
        mcq.class = sol.class;
      }

      // Deduplicate by sourceSolutionId
      const existing = await db.collection("mcq_questions").findOne({
        sourceSolutionId: sol._id?.toString(),
      });

      if (!existing) {
        try {
          const result = await db.collection("mcq_questions").insertOne(mcq);
          generated.push({ ...mcq, _id: result.insertedId });
        } catch (insertErr: any) {
          // Duplicate key race: another request inserted first — skip gracefully
          if (insertErr.code === 11000) {
            continue;
          }
          throw insertErr;
        }
      }
    }

    return NextResponse.json({
      message: `Generated ${generated.length} new MCQ questions (${solutionsToUse.length - generated.length} already existed)`,
      generated: generated.length,
      totalProcessed: solutionsToUse.length,
    });
  } catch (error) {
    console.error("MCQ Generate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
