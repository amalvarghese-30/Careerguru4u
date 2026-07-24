import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";
import { collegeSchema } from "@/lib/validations";

/* ---------- GET: Search colleges (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // ----------- NQL injection hardening ----------
    const safeSearch = escapeRegex(search);
    // ---------------------------------------------

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: safeSearch } },
        { location: { $regex: safeSearch } },
      ];
    }

    // Strict query shape validation (prevent prototype pollution)
    const colleges = await db.collection("colleges")
      .find(query)
      .sort({ name: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ colleges, total: colleges.length });
  } catch (err) {
    console.error("[SECURITY] Admin colleges GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a college ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict validation ----------
    const validation = collegeSchema.strict().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("colleges").insertOne({
      ...validation.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE",
      collection: "colleges",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { name: validation.data.name },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin colleges POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a college ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Expect either `_id` or `id` in payload
    const { _id, id: bodyId, ...data } = body;
    const docId = _id ?? bodyId;
    if (!docId) return NextResponse.json({ error: "College ID is required" }, { status: 400 });

    // Validate ObjectId format before using it
    validateObjectId(docId);

    // ----------- Strict partial validation ----------
    const validation = collegeSchema.partial().strict().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("colleges").updateOne(
      { _id: new ObjectId(docId) },
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    await logAudit({
      action: "UPDATE",
      collection: "colleges",
      documentId: docId,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin colleges PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a college ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "College ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("colleges").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "colleges",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin colleges DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}