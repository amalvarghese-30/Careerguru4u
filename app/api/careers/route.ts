import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || "";
    const search = searchParams.get("search") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = { status: { $ne: "archived" } };
    if (stream) query.stream = stream;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { stream: { $regex: search, $options: "i" } },
      ];
    }

    const careers = await db.collection("careers")
      .find(query)
      .sort({ title: 1 })
      .toArray();

    if (careers.length === 0) {
      const { careersData } = await import("@/lib/careers-data");
      const allSlugs = Object.keys(careersData);
      return NextResponse.json({
        careers: allSlugs.map(slug => ({ ...careersData[slug], _id: slug })),
        total: allSlugs.length,
      });
    }

    return NextResponse.json({ careers, total: careers.length });
  } catch (error) {
    console.error("Public careers GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
