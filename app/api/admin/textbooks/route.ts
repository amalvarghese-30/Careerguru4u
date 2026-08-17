import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { uploadToCloudinary, deleteFromCloudinary, generateKey } from "@/lib/storage/cloudinary";

/* ---------- Allowed fields for Textbook ---------- */
const ALLOWED_TEXTBOOK_FIELDS = new Set([
  "title",
  "board",
  "class",
  "subject",
  "file",
  "fileUrl",
  "fileName",
  "fileSize",
  "downloads",
  "cloudinaryPublicId",
  // eBalbharati-specific fields
  "medium",
  "variant",
  "code",
  "officialUrl",
  "directPdfUrl",
  "isOfficial",
  "sizeMB",
]);

/* ---------- GET: Search textbooks (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";

    // Sanitize subject regex
    const safeSubject = escapeRegex(subject);

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (board) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (safeSubject) query.subject = { $regex: safeSubject, $options: "i" };

    const textbooks = await db.collection("textbooks")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ textbooks });
  } catch (err) {
    console.error("[SECURITY] Admin textbooks GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a textbook ---------- */
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

    // ----------- Strict field validation (whitelist) ----------
    const providedKeys = new Set(formData.keys());
    if (!Array.from(providedKeys).every(k => ALLOWED_TEXTBOOK_FIELDS.has(k))) {
      return NextResponse.json({ error: "Invalid fields supplied" }, { status: 400 });
    }

    if (!board || !classStr || !subject) {
      return NextResponse.json(
        { error: "board, class, and subject are required" },
        { status: 400 }
      );
    }

    if (!["CBSE", "ICSE", "Maharashtra Board"].includes(board)) {
      return NextResponse.json(
        { error: "Invalid board. Must be CBSE, ICSE, or Maharashtra Board." },
        { status: 400 }
      );
    }

    // Validate that class is a number
    const classNum = parseInt(classStr, 10);
    if (isNaN(classNum) || classNum <= 0) {
      return NextResponse.json({ error: "Class must be a positive integer." }, { status: 400 });
    }

    // Handle file upload or URL fallback
    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;
    let cloudinaryPublicId = "";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileSize = file.size;
      cloudinaryPublicId = generateKey("textbooks", fileName);
      fileUrl = await uploadToCloudinary(cloudinaryPublicId, buffer, file.type || "application/pdf");
    } else {
      // Allow passing an existing file URL if uploading via UI
      fileUrl = formData.get("fileUrl") as string || "";
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Either a file upload or a fileUrl is required." },
        { status: 400 }
      );
    }

    // Build document
    const doc: Record<string, unknown> = {
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
      // eBalbharati-specific fields (optional)
      medium: formData.get("medium") as string || "",
      variant: formData.get("variant") ? parseInt(formData.get("variant") as string) : undefined,
      code: formData.get("code") as string || "",
      officialUrl: formData.get("officialUrl") as string || "",
      directPdfUrl: formData.get("directPdfUrl") as string || "",
      isOfficial: formData.get("isOfficial") === "true",
      sizeMB: formData.get("sizeMB") ? parseFloat(formData.get("sizeMB") as string) : undefined,
    };

    if (cloudinaryPublicId) doc.cloudinaryPublicId = cloudinaryPublicId;

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("textbooks").insertOne(doc);

    await logAudit({
      action: "CREATE",
      collection: "textbooks",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { title: doc.title, board: doc.board, class: doc.class, subject: doc.subject },
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      fileUrl,
    });
  } catch (err) {
    console.error("[SECURITY] Admin textbooks POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a textbook ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Validate ObjectId format
    const client = await clientPromise;
    const db = client.db("career_guru");

    // Fetch the doc BEFORE deleting so we can clean up its Cloudinary file
    const doc = await db.collection("textbooks").findOne({ _id: new ObjectId(id) });
    await db.collection("textbooks").deleteOne({ _id: new ObjectId(id) });

    // Delete associated Cloudinary file if it exists
    if (doc?.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(doc.cloudinaryPublicId as string);
      } catch (e) {
        console.error("Failed to delete from Cloudinary:", e);
      }
    }

    await logAudit({
      action: "DELETE",
      collection: "textbooks",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin textbooks DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update textbook metadata ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, title, board, class: classNum, subject, fileUrl } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (title !== undefined) update.title = String(title).trim();
    if (board !== undefined) {
      if (!["CBSE", "ICSE", "Maharashtra Board"].includes(board)) {
        return NextResponse.json({ error: "Invalid board. Must be CBSE, ICSE, or Maharashtra Board." }, { status: 400 });
      }
      update.board = board;
    }
    if (classNum !== undefined && classNum !== "") {
      const c = parseInt(classNum, 10);
      if (isNaN(c) || c <= 0) return NextResponse.json({ error: "Class must be a positive integer." }, { status: 400 });
      update.class = c;
    }
    if (subject !== undefined) update.subject = String(subject).trim();
    if (fileUrl !== undefined) update.fileUrl = String(fileUrl).trim();
    // eBalbharati-specific fields
    if (body.medium !== undefined) update.medium = String(body.medium).trim();
    if (body.variant !== undefined && body.variant !== "") update.variant = parseInt(body.variant);
    if (body.code !== undefined) update.code = String(body.code).trim();
    if (body.officialUrl !== undefined) update.officialUrl = String(body.officialUrl).trim();
    if (body.directPdfUrl !== undefined) update.directPdfUrl = String(body.directPdfUrl).trim();
    if (body.isOfficial !== undefined) update.isOfficial = Boolean(body.isOfficial);
    if (body.sizeMB !== undefined && body.sizeMB !== "") update.sizeMB = parseFloat(body.sizeMB);

    const result = await db.collection("textbooks").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Textbook not found" }, { status: 404 });
    }

    await logAudit({
      action: "UPDATE",
      collection: "textbooks",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin textbooks PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}