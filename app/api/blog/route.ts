import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = { status: "published" };
    if (category) query.category = category;

    const posts = await db.collection("blog_posts")
      .find(query, { projection: { content: 0 } })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(Math.min(limit, 50))
      .toArray();

    return NextResponse.json({ posts, total: posts.length });
  } catch (error) {
    console.error("Public blog GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
