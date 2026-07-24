import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"] as const;
const QUESTION_TYPES = ["mcq", "short", "long", "diagram", "numerical", "derivation"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const SOURCE_TYPES = ["scraped", "manual", "ai-enhanced"] as const;

/* ---------- Helper to filter unknown keys ---------- */
function filterUnknownKeys<T>(obj: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (allowed.has(key)) result[key] = obj[key];
  }
  return result;
}

/* ---------- GET: Search solutions (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";
    const chapter = searchParams.get("chapter") || "";
    const search = searchParams.get("search") || "";

    // ----------- NQL injection hardening ----------
    const safeSearch = escapeRegex(search);
    const safeChapter = escapeRegex(chapter);
    // ---------------------------------------------

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (board && ["CBSE", "ICSE", "Maharashtra Board"].includes(board)) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (subject) query.subject = subject;
    if (safeChapter) query.chapter = { $regex: safeChapter, $options: "i" };
    if (safeSearch) {
      query.$or = [
        { question: { $regex: safeSearch, $options: "i" } },
        { answer: { $regex: safeSearch, $options: "i" } },
        { subject: { $regex: safeSearch, $options: "i" } },
        { chapter: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const solutions = await db
      .collection("solutions")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    const total = await db.collection("solutions").countDocuments();

    return NextResponse.json({ solutions, total });
  } catch (err) {
    console.error("[SECURITY] Admin solutions GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a solution ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict field validation (whitelist) ----------
    const allowedKeys = new Set([
      "question",
      "questionBlocks",
      "answer",
      "answerBlocks",
      "answerHtml",
      "questionHtml",
      "board",
      "class",
      "subject",
      "chapter",
      "questionNumber",
      "questionType",
      "difficulty",
      "sourceType",
      "sourceUrl",
      "isFree",
      "viewCount",
      "helpfulCount",
      "version",
      "originalData",
      "tables",
      "equations",
      "images",
      "tables",
      "tables",
      "tables",
    ] as const);
    const bodyKeys = new Set(Object.keys(body));
    if (!Array.from(bodyKeys).every(k => allowedKeys.has(k))) {
      return NextResponse.json({ error: "Invalid fields supplied" }, { status: 400 });
    }

    if (!body.board || !body.class || !body.subject || !body.chapter) {
      return NextResponse.json(
        { error: "Missing required fields: board, class, subject, chapter" },
        { status: 400 }
      );
    }

    if (!["CBSE", "ICSE", "Maharashtra Board"].includes(body.board)) {
      return NextResponse.json(
        { error: `Invalid board. Must be one of: ${["CBSE", "ICSE", "Maharashtra Board"].join(", ")}` },
        { status: 400 }
      );
    }

    // Build document with both legacy string fields and block fields
    const questionBlocks: ContentBlock[] = body.questionBlocks || [];
    const solutionSteps: SolutionStep[] = body.solutionSteps || [];

    const questionText = body.question?.trim() || extractPlainText(questionBlocks);
    const answerText = body.answer?.trim() || extractPlainFromSteps(solutionSteps);

    const questionType = QUESTION_TYPES.includes(body.questionType) ? body.questionType : undefined;
    const difficulty = DIFFICULTIES.includes(body.difficulty) ? body.difficulty : undefined;
    const sourceType = SOURCE_TYPES.includes(body.sourceType) ? body.sourceType : "manual";

    const doc: Record<string, unknown> = {
      question: questionText,
      answer: answerText,
      board: body.board,
      class: parseInt(body.class),
      subject: body.subject.trim(),
      chapter: body.chapter.trim(),
      questionNumber: body.questionNumber || 1,
      sourceUrl: body.sourceUrl || "",
      sourceType,
      isFree: body.isFree ?? true,
      viewCount: 0,
      helpfulCount: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (questionType) doc.questionType = questionType;
    if (difficulty) doc.difficulty = difficulty;

    // Store block content when provided
    if (body.questionHtml) doc.questionHtml = body.questionHtml;
    if (body.answerHtml) doc.answerHtml = body.answerHtml;
    if (body.questionBlocks) doc.questionBlocks = questionBlocks;
    if (body.solutionSteps) doc.solutionSteps = solutionSteps;
    if (body.tables) doc.tables = body.tables;
    if (body.equations) doc.equations = body.equations;
    if (body.images) doc.images = body.images;

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("solutions").insertOne(doc);

    await logAudit({
      action: "CREATE",
      collection: "solutions",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: {
        question: doc.question,
        board: doc.board,
        class: doc.class,
        subject: doc.subject,
        chapter: doc.chapter,
        hasBlocks: !!body.questionBlocks,
      },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin solutions POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a solution ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { _id, ...data } = await req.json();
    if (!_id) return NextResponse.json({ error: "Solution ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(_id);

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Fetch existing doc for version history
    const existing = await db.collection("solutions").findOne({ _id: new ObjectId(_id) });
    if (!existing) return NextResponse.json({ error: "Solution not found" }, { status: 404 });

    // Build update payload
    const update: Record<string, unknown> = {};

    // Handle block content updates
    let isBlockUpdate = false;
    if (data.questionBlocks !== undefined) {
      isBlockUpdate = true;
      update.questionBlocks = data.questionBlocks;
      update.question = extractPlainText(data.questionBlocks);
    }
    if (data.solutionSteps !== undefined) {
      isBlockUpdate = true;
      update.solutionSteps = data.solutionSteps;
      update.answer = extractPlainFromSteps(data.solutionSteps);
    }

    // Version bump
    if (isBlockUpdate) {
      update.version = (existing.version || 1) + 1;
    }

    // Legacy string field updates (if not already handled by block update)
    if (data.question !== undefined && !isBlockUpdate) update.question = data.question.trim();
    if (data.answer !== undefined && !isBlockUpdate) update.answer = data.answer.trim();

    // Shared fields
    if (data.board !== undefined) {
      if (!["CBSE", "ICSE", "Maharashtra Board"].includes(data.board)) return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      update.board = data.board;
    }
    if (data.class !== undefined) update.class = parseInt(data.class);
    if (data.subject !== undefined) update.subject = data.subject.trim();
    if (data.chapter !== undefined) update.chapter = data.chapter.trim();
    if (data.questionNumber !== undefined) update.questionNumber = data.questionNumber;
    if (data.isFree !== undefined) update.isFree = data.isFree;
    if (data.sourceUrl !== undefined) update.sourceUrl = data.sourceUrl;
    if (data.sourceType !== undefined) {
      if (!["scraped", "manual", "ai-enhanced"].includes(data.sourceType)) return NextResponse.json({ error: "Invalid sourceType" }, { status: 400 });
      update.sourceType = data.sourceType;
    }
    if (data.questionType !== undefined) {
      if (!QUESTION_TYPES.includes(data.questionType)) return NextResponse.json({ error: "Invalid questionType" }, { status: 400 });
      update.questionType = data.questionType;
    }
    if (data.difficulty !== undefined) {
      if (!DIFFICULTIES.includes(data.difficulty)) return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
      update.difficulty = data.difficulty;
    }
    if (data.questionHtml !== undefined) update.questionHtml = data.questionHtml;
    if (data.answerHtml !== undefined) update.answerHtml = data.answerHtml;
    if (data.tables !== undefined) update.tables = data.tables;
    if (data.equations !== undefined) update.equations = data.equations;
    if (data.images !== undefined) update.images = data.images;

    update.updatedAt = new Date();

    await db.collection("solutions").updateOne({ _id: new ObjectId(_id) }, { $set: update });

    await logAudit({
      action: "UPDATE",
      collection: "solutions",
      documentId: _id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { ...update, isBlockUpdate },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin solutions PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a solution ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Solution ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("solutions").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "solutions",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin solutions DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- Helper functions for block parsing ---------- */
function extractPlainText(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return "";
  return blocks
    .map((b) => {
      if (b.content) return b.content;
      if (b.children && b.children.length > 0) return extractPlainText(b.children);
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function extractPlainFromSteps(steps: SolutionStep[]): string {
  if (!steps || steps.length === 0) return "";
  return steps
    .map((s) => extractPlainText(s.blocks))
    .filter(Boolean)
    .join("\n\n");
}