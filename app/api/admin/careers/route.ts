import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { careerSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const stream = searchParams.get("stream") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (stream) query.stream = stream;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { stream: { $regex: search, $options: "i" } },
      ];
    }

    const careers = await db.collection("careers").find(query).sort({ title: 1 }).toArray();

    if (careers.length === 0) {
      const { careersData } = await import("@/lib/careers-data");
      const allSlugs = Object.keys(careersData);
      return NextResponse.json({
        careers: allSlugs.map(slug => ({ ...careersData[slug], _id: slug })),
        total: allSlugs.length,
      });
    }

    return NextResponse.json({ careers, total: careers.length });
  } catch (error) {
    console.error("Admin careers GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const validation = careerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

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
  } catch (error) {
    console.error("Admin careers POST error:", error);
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
    if (!docId) return NextResponse.json({ error: "Career ID is required" }, { status: 400 });

    const validation = careerSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const filter = typeof docId === "string" && docId.length === 24 ? { _id: new ObjectId(docId) } : { _id: docId };
    await db.collection("careers").updateOne(filter, { $set: { ...validation.data, updatedAt: new Date() } });

    await logAudit({
      action: "UPDATE",
      collection: "careers",
      documentId: docId,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin careers PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Career ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");
    const filter = id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
    await db.collection("careers").deleteOne(filter as Record<string, unknown>);

    await logAudit({
      action: "DELETE",
      collection: "careers",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin careers DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
