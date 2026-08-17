import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 50);
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = { status: "published" };
    if (category) query.category = category;

    const [posts, totalCount] = await Promise.all([
      db.collection("blog_posts")
        .find(query, { projection: { content: 0 } })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("blog_posts").countDocuments(query),
    ]);

    return NextResponse.json(
      { posts, total: totalCount, totalCount, page, limit },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
    );
  } catch (error) {
    console.error("Public blog GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
