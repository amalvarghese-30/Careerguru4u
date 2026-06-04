import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { scholarshipSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
      ];
    }

    const scholarships = await db.collection("scholarships").find(query).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ scholarships, total: scholarships.length });
  } catch (error) {
    console.error("Admin scholarships GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = scholarshipSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("scholarships").insertOne({
      ...validation.data, createdAt: new Date(), updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE", collection: "scholarships",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { title: validation.data.title },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Admin scholarships POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { _id, id: bodyId, ...data } = body;
    const docId = _id || bodyId;
    if (!docId) return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });

    const validation = scholarshipSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("scholarships").updateOne(
      { _id: new ObjectId(docId) }, { $set: { ...validation.data, updatedAt: new Date() } }
    );

    await logAudit({
      action: "UPDATE", collection: "scholarships", documentId: docId,
      performedBy: admin.userId, performedByEmail: admin.email, changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin scholarships PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("scholarships").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "scholarships", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin scholarships DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
