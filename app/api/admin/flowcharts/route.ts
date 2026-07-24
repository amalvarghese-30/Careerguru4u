import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { flowchartNodeSchema } from "@/lib/validations";
import { validateObjectId } from "@/lib/security";

/* ---------- GET: Retrieve flowchart nodes (optional level filter) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");

    // Validate numeric level (prevent prototype pollution)
    let filterLevel: number | null = null;
    if (level !== null && level !== "") {
      const parsed = Number(level);
      if (!Number.isNaN(parsed) && parsed >= 0) filterLevel = parsed;
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const query: Record<string, unknown> = {};

    if (filterLevel !== null) query.level = filterLevel;

    const nodes = await db.collection("flowchart_nodes")
      .find(query)
      .sort({ level: 1, name: 1 })
      .toArray();

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error("[SECURITY] Admin flowcharts GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a flowchart node ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict validation with unknown-field rejection ----------
    const validation = flowchartNodeSchema.strict().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const doc = { ...validation.data, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("flowchart_nodes").insertOne(doc);

    await logAudit({
      action: "CREATE",
      collection: "flowchart_nodes",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { name: doc.name, level: doc.level },
    });

    return NextResponse.json({ success: true, node: { ...doc, _id: result.insertedId } });
  } catch (err) {
    console.error("[SECURITY] Admin flowcharts POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a flowchart node ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Expect either full `_id` or `id` field
    const { id, ...data } = body;
    const docId = id || (body.id as string);
    if (!docId) return NextResponse.json({ error: "Node ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(docId);

    // Strict partial validation (rejects unknown fields)
    const validation = flowchartNodeSchema.partial().strict().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("flowchart_nodes").updateOne(
      { _id: new ObjectId(docId) },
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    await logAudit({
      action: "UPDATE",
      collection: "flowchart_nodes",
      documentId: docId,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin flowcharts PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a flowchart node ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Node ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("flowchart_nodes").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "flowchart_nodes",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin flowcharts DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}