import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const client = await clientPromise;
    const db = client.db("career_guru");

    const college = await db.collection("colleges").findOne({ slug });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const { _id, ...data } = college;
    return NextResponse.json({ college: { ...data, _id: _id?.toString() } });
  } catch (error) {
    console.error("Public college GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
