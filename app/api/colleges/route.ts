import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const featured = searchParams.get("featured");
    const course = searchParams.get("course") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Always exclude hidden colleges from public listing
    const query: Record<string, unknown> = { hidden: { $ne: true } };
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: "i" };
    if (featured === "true") query.featured = true;

    // Filter by category (e.g., engineering, medical, mba) or fallback to course name matching
    if (course && search) {
      // Both course and search: combine with $and of two $or clauses
      query.$and = [
        { $or: [{ category: course }, { courses: { $regex: course, $options: "i" } }] },
        { $or: [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { courses: { $regex: search, $options: "i" } },
        ]},
      ];
    } else if (course) {
      query.$or = [
        { category: course },
        { courses: { $regex: course, $options: "i" } },
      ];
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { courses: { $regex: search, $options: "i" } },
      ];
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limitRaw = parseInt(searchParams.get("limit") || "");
    const limit = limitRaw ? Math.min(Math.max(limitRaw, 1), 200) : 0; // 0 = no limit (backward compatible)
    const skip = limit ? (page - 1) * limit : 0;

    const find = db.collection("colleges").find(query).sort({ name: 1 });
    const [colleges, totalCount] = await Promise.all([
      limit ? find.skip(skip).limit(limit).toArray() : find.toArray(),
      db.collection("colleges").countDocuments(query),
    ]);

    return NextResponse.json(
      { colleges, total: totalCount, totalCount, page, limit: limit || colleges.length },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } }
    );
  } catch (error) {
    console.error("Public colleges GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
