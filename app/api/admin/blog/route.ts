import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";
import { blogPostSchema } from "@/lib/validations";

/* ---------- GET: Search blog posts (sanitized regex) ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // ----------- NQL injection hardening ----------
    const safeSearch = escapeRegex(search);
    // ---------------------------------------------

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: safeSearch } },
        { category: { $regex: safeSearch } },
      ];
    }

    // Strict query shape (no prototype pollution)
    const posts = await db.collection("blog_posts")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    const total = await db.collection("blog_posts").countDocuments();

    return NextResponse.json({ posts, total });
  } catch (err) {
    console.error("[SECURITY] Admin blog GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a blog post ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ----------- Strict validation ----------
    const validation = blogPostSchema.strict().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const doc = { ...validation.data, views: 0, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("blog_posts").insertOne(doc);

    await logAudit({
      action: "CREATE",
      collection: "blog_posts",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { title: doc.title },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin blog POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a blog post ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { _id, ...data } = await req.json();
    if (!_id) return NextResponse.json({ error: "Blog post ID is required" }, { status: 400 });

    // Validate ObjectId format before using it
    validateObjectId(_id);

    // ----------- Strict partial validation ----------
    const validation = blogPostSchema.partial().strict().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("blog_posts").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    await logAudit({
      action: "UPDATE",
      collection: "blog_posts",
      documentId: _id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin blog PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a blog post ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Blog post ID is required" }, { status: 400 });

    // Validate ObjectId format
    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("blog_posts").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "blog_posts",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin blog DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}