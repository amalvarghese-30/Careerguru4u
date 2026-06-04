import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const client = await clientPromise;
    const db = client.db("career_guru");

    const career = await db.collection("careers").findOne({ slug });

    if (career) {
      const { _id, ...data } = career;
      return NextResponse.json({ career: { id: slug, ...data, _id: _id?.toString() } });
    }

    // Fallback to hardcoded data
    const { getCareerById } = await import("@/lib/careers-data");
    const fallback = getCareerById(slug);
    if (!fallback) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }
    return NextResponse.json({ career: fallback });
  } catch (error) {
    console.error("Public career GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
