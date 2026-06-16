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
    const type = searchParams.get("type") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (board) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (type === "note" || type === "video") query.type = type;

    const notes = await db.collection("concept_notes").find(query).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Admin concept-notes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.title || !body.board || !body.class || !body.subject || !body.type) {
      return NextResponse.json({ error: "title, board, class, subject, and type are required" }, { status: 400 });
    }

    if (!BOARDS.includes(body.board)) {
      return NextResponse.json({ error: "Invalid board" }, { status: 400 });
    }

    if (body.type === "video" && !body.videoUrl) {
      return NextResponse.json({ error: "videoUrl is required for video type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const doc = {
      title: body.title.trim(),
      board: body.board,
      class: parseInt(body.class),
      subject: body.subject.trim(),
      chapter: body.chapter?.trim() || "",
      type: body.type,
      content: body.content?.trim() || "",
      videoUrl: body.videoUrl?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("concept_notes").insertOne(doc);

    await logAudit({
      action: "CREATE", collection: "concept_notes",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { title: doc.title, type: doc.type, board: doc.board, class: doc.class, subject: doc.subject },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Admin concept-notes POST error:", error);
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
    if (data.chapter !== undefined) update.chapter = data.chapter.trim();
    if (data.type !== undefined) update.type = data.type;
    if (data.content !== undefined) update.content = data.content.trim();
    if (data.videoUrl !== undefined) update.videoUrl = data.videoUrl.trim();
    update.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("concept_notes").updateOne({ _id: new ObjectId(_id) }, { $set: update });

    await logAudit({
      action: "UPDATE", collection: "concept_notes", documentId: _id,
      performedBy: admin.userId, performedByEmail: admin.email, changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin concept-notes PUT error:", error);
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
    await db.collection("concept_notes").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "concept_notes", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin concept-notes DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
