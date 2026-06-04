import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (level !== null && level !== "") query.level = Number(level);

    const nodes = await db.collection("flowchart_nodes")
      .find(query)
      .sort({ level: 1, name: 1 })
      .toArray();

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error("Public flowcharts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
