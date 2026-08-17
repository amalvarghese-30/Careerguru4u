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

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limitRaw = parseInt(searchParams.get("limit") || "");
    const limit = limitRaw ? Math.min(Math.max(limitRaw, 1), 200) : 0; // 0 = no limit (backward compatible)
    const skip = limit ? (page - 1) * limit : 0;

    const find = db.collection("scholarships").find(query).sort({ createdAt: -1 });
    const [scholarships, totalCount] = await Promise.all([
      limit ? find.skip(skip).limit(limit).toArray() : find.toArray(),
      db.collection("scholarships").countDocuments(query),
    ]);

    return NextResponse.json(
      { scholarships, total: totalCount, totalCount, page, limit: limit || scholarships.length },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
    );
  } catch (error) {
    console.error("Public scholarships GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
