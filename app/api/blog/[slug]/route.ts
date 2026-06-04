import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const client = await clientPromise;
    const db = client.db("career_guru");

    const post = await db.collection("blog_posts").findOne({ slug, status: "published" });

    if (!post) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view count
    await db.collection("blog_posts").updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    const { _id, ...data } = post;
    return NextResponse.json({ post: { ...data, _id: _id?.toString(), views: (post.views || 0) + 1 } });
  } catch (error) {
    console.error("Public blog detail GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
