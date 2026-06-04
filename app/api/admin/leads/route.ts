import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { logAudit } from "@/lib/audit-log";

const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await db.collection("leads").find(query).sort({ createdAt: -1 }).limit(200).toArray();

    const total = await db.collection("leads").countDocuments();
    const newLeads = await db.collection("leads").countDocuments({ status: "new" });
    const contacted = await db.collection("leads").countDocuments({ status: "contacted" });
    const qualified = await db.collection("leads").countDocuments({ status: "qualified" });
    const converted = await db.collection("leads").countDocuments({ status: "converted" });
    const lost = await db.collection("leads").countDocuments({ status: "lost" });

    return NextResponse.json({
      leads,
      funnel: { total, newLeads, contacted, qualified, converted, lost },
    });
  } catch (error) {
    console.error("Admin leads GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, assignedTo, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;
    if (notes !== undefined) data.notes = notes;

    const validation = leadUpdateSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const update: Record<string, unknown> = { ...validation.data, updatedAt: new Date() };
    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("leads").updateOne({ _id: new ObjectId(id) }, { $set: update });

    await logAudit({
      action: "UPDATE", collection: "leads", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email, changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin leads PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    const lead = await db.collection("leads").findOne({ _id: new ObjectId(id) });
    await db.collection("leads").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "leads", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: lead ? { email: lead.email, name: lead.name } : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin leads DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
