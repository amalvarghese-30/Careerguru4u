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

    const counsellingRequests = await db.collection("counselling_requests")
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      bookmarks,
      counsellingRequests,
      stats: {
        savedCareers: bookmarks.filter((b: { itemType: string }) => b.itemType === "career").length,
        savedColleges: bookmarks.filter((b: { itemType: string }) => b.itemType === "college").length,
        counsellingCount: counsellingRequests.length,
      },
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
