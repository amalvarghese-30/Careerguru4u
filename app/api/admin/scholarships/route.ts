import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";
import { scholarshipSchema } from "@/lib/validations";

/* ---------- GET: Search scholarships (sanitized regex) ---------- */
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
        { title: { $regex: safeSearch } },
        { provider: { $regex: safeSearch } },
      ];
    }

    // Strict query shape (no prototype pollution)
    const scholarships = await db.collection("scholarships")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ scholarships, total: scholarships.length });
  } catch (err) {
    console.error("[SECURITY] Admin scholarships GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a scholarship ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict validation ----------
    const validation = scholarshipSchema.strict().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("scholarships").insertOne({
      ...validation.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE",
      collection: "scholarships",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { title: validation.data.title },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin scholarships POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a scholarship ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Expect either `_id` or `id` in payload
    const { _id, id: bodyId, ...data } = body;
    const docId = _id ?? bodyId;
    if (!docId) return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });

    // Validate ObjectId format before using it
    validateObjectId(docId);

    // ----------- Strict partial validation ----------
    const validation = scholarshipSchema.partial().strict().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("scholarships").updateOne(
      { _id: new ObjectId(docId) },
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    await logAudit({
      action: "UPDATE",
      collection: "scholarships",
      documentId: docId,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin scholarships PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a scholarship ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("scholarships").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "scholarships",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin scholarships DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}