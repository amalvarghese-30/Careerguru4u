import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = { status: "active" };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
      ];
    }

    const scholarships = await db.collection("scholarships")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ scholarships, total: scholarships.length });
  } catch (error) {
    console.error("Public scholarships GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
