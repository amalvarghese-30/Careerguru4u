import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"] as const;

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

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (board && BOARDS.includes(board as typeof BOARDS[number])) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (subject) query.subject = subject;
    if (chapter) query.chapter = { $regex: chapter, $options: "i" };
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { chapter: { $regex: search, $options: "i" } },
      ];
    }

    const solutions = await db.collection("solutions").find(query).sort({ createdAt: -1 }).limit(100).toArray();
    const total = await db.collection("solutions").countDocuments();

    return NextResponse.json({ solutions, total });
  } catch (error) {
    console.error("Admin solutions GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.question || !body.answer || !body.board || !body.class || !body.subject || !body.chapter) {
      return NextResponse.json({ error: "Missing required fields: question, answer, board, class, subject, chapter" }, { status: 400 });
    }

    if (!BOARDS.includes(body.board)) {
      return NextResponse.json({ error: `Invalid board. Must be one of: ${BOARDS.join(", ")}` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const doc = {
      question: body.question.trim(),
      answer: body.answer.trim(),
      board: body.board,
      class: parseInt(body.class),
      subject: body.subject.trim(),
      chapter: body.chapter.trim(),
      questionNumber: body.questionNumber || 1,
      isFree: body.isFree ?? true,
      viewCount: 0,
      helpfulCount: 0,
      createdAt: new Date(),
    };

    const result = await db.collection("solutions").insertOne(doc);

    await logAudit({
      action: "CREATE", collection: "solutions",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { question: doc.question, board: doc.board, class: doc.class, subject: doc.subject, chapter: doc.chapter },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Admin solutions POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { _id, ...data } = await req.json();
    if (!_id) return NextResponse.json({ error: "Solution ID is required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (data.question !== undefined) update.question = data.question.trim();
    if (data.answer !== undefined) update.answer = data.answer.trim();
    if (data.board !== undefined) {
      if (!BOARDS.includes(data.board)) return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      update.board = data.board;
    }
    if (data.class !== undefined) update.class = parseInt(data.class);
    if (data.subject !== undefined) update.subject = data.subject.trim();
    if (data.chapter !== undefined) update.chapter = data.chapter.trim();
    if (data.questionNumber !== undefined) update.questionNumber = data.questionNumber;
    if (data.isFree !== undefined) update.isFree = data.isFree;

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("solutions").updateOne(
      { _id: new ObjectId(_id) }, { $set: update }
    );

    await logAudit({
      action: "UPDATE", collection: "solutions", documentId: _id,
      performedBy: admin.userId, performedByEmail: admin.email, changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin solutions PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Solution ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("solutions").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "solutions", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin solutions DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
