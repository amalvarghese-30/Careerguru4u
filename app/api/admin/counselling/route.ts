import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { sessionUpdateSchema } from "@/lib/validations";

/* ---------- GET: Search counselling requests (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // ----------- NQL injection hardening ----------
    const safeSearch = escapeRegex(search);
    // ---------------------------------------------

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: safeSearch } },
        { email: { $regex: safeSearch } },
        { phone: { $regex: safeSearch } },
      ];
    }

    const requests = await db.collection("counselling_requests")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("[SECURITY] Admin counselling GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update counselling request ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, assignedTo, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "Request ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    // Strict validation of update data (reject unknown keys)
    const validation = sessionUpdateSchema.strict().safeParse({ status, assignedTo, notes });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { ...validation.data, updatedAt: new Date() };
    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("counselling_requests").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    await logAudit({
      action: "UPDATE",
      collection: "counselling_requests",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin counselling PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove counselling request ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Request ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("counselling_requests").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "counselling_requests",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin counselling DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}