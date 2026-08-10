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

    const colleges = await db.collection("colleges")
      .find(query)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ colleges, total: colleges.length });
  } catch (error) {
    console.error("Public colleges GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
