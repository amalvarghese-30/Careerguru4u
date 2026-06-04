import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db("career_guru");

    const bookmarks = await db.collection("bookmarks")
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { itemId, itemType, title } = await req.json();
    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const existing = await db.collection("bookmarks").findOne({
      userId: user.userId, itemId, itemType,
    });

    if (existing) {
      await db.collection("bookmarks").deleteOne({ _id: existing._id });
      return NextResponse.json({ success: true, bookmarked: false });
    }

    await db.collection("bookmarks").insertOne({
      userId: user.userId, itemId, itemType, title: title || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, bookmarked: true });
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
