import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const textbooks = await db.collection("textbooks").find(query).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ textbooks });
  } catch (error) {
    console.error("Admin textbooks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const board = formData.get("board") as string;
    const classStr = formData.get("class") as string;
    const subject = formData.get("subject") as string;
    const title = formData.get("title") as string;

    if (!board || !classStr || !subject) {
      return NextResponse.json({ error: "board, class, and subject are required" }, { status: 400 });
    }

    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileSize = file.size;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "textbooks");
      await mkdir(uploadDir, { recursive: true });

      const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(uploadDir, uniqueName), buffer);
      fileUrl = `/uploads/textbooks/${uniqueName}`;
    } else {
      fileUrl = (formData.get("fileUrl") as string) || "";
    }

    if (!fileUrl) {
      return NextResponse.json({ error: "Either file upload or fileUrl is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const doc = {
      title: title || fileName || "Textbook",
      board,
      class: parseInt(classStr),
      subject: subject.trim(),
      fileUrl,
      fileName,
      fileSize,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("textbooks").insertOne(doc);

    await logAudit({
      action: "CREATE", collection: "textbooks",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { title: doc.title, board: doc.board, class: doc.class, subject: doc.subject },
    });

    return NextResponse.json({ success: true, id: result.insertedId, fileUrl });
  } catch (error) {
    console.error("Admin textbooks POST error:", error);
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
    await db.collection("textbooks").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "textbooks", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin textbooks DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
