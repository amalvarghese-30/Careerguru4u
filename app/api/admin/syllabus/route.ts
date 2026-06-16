import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (board) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (subject) query.subject = { $regex: subject, $options: "i" };

    const syllabus = await db.collection("syllabus").find(query).sort({ year: -1, createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ syllabus });
  } catch (error) {
    console.error("Admin syllabus GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.title || !body.board || !body.class || !body.subject || !body.content) {
      return NextResponse.json({ error: "title, board, class, subject, and content are required" }, { status: 400 });
    }

    if (!BOARDS.includes(body.board)) {
      return NextResponse.json({ error: "Invalid board" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const doc = {
      title: body.title.trim(),
      board: body.board,
      class: parseInt(body.class),
      subject: body.subject.trim(),
      content: body.content.trim(),
      year: body.year?.trim() || new Date().getFullYear().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("syllabus").insertOne(doc);

    await logAudit({
      action: "CREATE", collection: "syllabus",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { title: doc.title, board: doc.board, class: doc.class, subject: doc.subject },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Admin syllabus POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { _id, ...data } = await req.json();
    if (!_id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title.trim();
    if (data.board !== undefined) update.board = data.board;
    if (data.class !== undefined) update.class = parseInt(data.class);
    if (data.subject !== undefined) update.subject = data.subject.trim();
    if (data.content !== undefined) update.content = data.content.trim();
    if (data.year !== undefined) update.year = data.year.trim();
    update.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("syllabus").updateOne({ _id: new ObjectId(_id) }, { $set: update });

    await logAudit({
      action: "UPDATE", collection: "syllabus", documentId: _id,
      performedBy: admin.userId, performedByEmail: admin.email, changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin syllabus PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("syllabus").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "syllabus", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin syllabus DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
