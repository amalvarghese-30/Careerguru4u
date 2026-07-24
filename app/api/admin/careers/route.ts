import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { careerSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";

/* ---------- GET: Search careers (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || "";
    const search = searchParams.get("search") || "";

    // ----------- NQL injection hardening ----------
    // escapeRegex throws on dangerous characters and caps length
    const safeSearch = escapeRegex(search);
    // ---------------------------------------------

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = { status: { $ne: "archived" } };
    if (stream) query.stream = stream;
    if (search) {
      query.$or = [
        { title: { $regex: safeSearch } },
        { stream: { $regex: safeSearch } },
      ];
    }

    const careers = await db.collection("careers")
      .find(query)
      .sort({ title: 1 })
      .toArray();

    if (careers.length === 0) {
      const { careersData } = await import("@/lib/careers-data");
      const allSlugs = Object.keys(careersData);
      return NextResponse.json({
        careers: allSlugs.map(slug => ({ ...careersData[slug], _id: slug })),
        total: allSlugs.length,
      });
    }

    return NextResponse.json({ careers, total: careers.length });
  } catch (err) {
    // ----------- Generic error response ----------
    console.error("[SECURITY] Admin careers GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a new career ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict validation with unknown‑field rejection ----------
    const validation = careerSchema.strict().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    // ----------- DB insertion ----------
    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("careers").insertOne({
      ...validation.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE",
      collection: "careers",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { title: validation.data.title },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin careers POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update an existing career ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Expect either `_id` or `id` in the payload
    const { _id, id: bodyId, ...data } = body;
    const docId = _id ?? bodyId;
    if (!docId) return NextResponse.json({ error: "Career ID is required" }, { status: 400 });

    // Validate ObjectId format before using it
    validateObjectId(docId);

    // ----------- Strict validation (partial update) ----------
    const validation = careerSchema.partial().strict().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const filter = typeof docId === "string" && docId.length === 24 ? { _id: new ObjectId(docId) } : { _id: docId };
    const update: Record<string, unknown> = { ...validation.data, updatedAt: new Date() };
    const result = await db.collection("careers").updateOne(filter, { $set: update });

    await logAudit({
      action: "UPDATE",
      collection: "careers",
      documentId: docId,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin careers PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a career ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Career ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    const filter = typeof id === "string" && id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
    const result = await db.collection("careers").deleteOne(filter as Record<string, unknown>);

    await logAudit({
      action: "DELETE",
      collection: "careers",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin careers DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}