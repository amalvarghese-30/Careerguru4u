import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { flowchartNodeSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");

    const client = await clientPromise;
    const db = client.db("career_guru");
    const query: Record<string, unknown> = {};
    if (level !== null && level !== "") query.level = Number(level);

    const nodes = await db.collection("flowchart_nodes").find(query).sort({ level: 1, name: 1 }).toArray();
    return NextResponse.json({ nodes });
  } catch (error) {
    console.error("Admin flowcharts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = flowchartNodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const doc = { ...validation.data, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("flowchart_nodes").insertOne(doc);

    await logAudit({
      action: "CREATE", collection: "flowchart_nodes",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { name: doc.name, level: doc.level },
    });

    return NextResponse.json({ success: true, node: { ...doc, _id: result.insertedId } });
  } catch (error) {
    console.error("Admin flowcharts POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Node ID is required" }, { status: 400 });

    const validation = flowchartNodeSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const update: Record<string, unknown> = { ...validation.data, updatedAt: new Date() };
    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("flowchart_nodes").updateOne({ _id: new ObjectId(id) }, { $set: update });

    await logAudit({
      action: "UPDATE", collection: "flowchart_nodes", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email, changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin flowcharts PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Node ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("flowchart_nodes").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "flowchart_nodes", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin flowcharts DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
