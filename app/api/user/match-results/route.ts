import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db("career_guru");

    const results = await db.collection("match_results")
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json({ result: results[0] || null });
  } catch (error) {
    console.error("Match results GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { matches } = await req.json();
    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ error: "matches array is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const doc = {
      userId: user.userId,
      matches: matches.map((m) => ({
        careerId: m.careerId,
        title: m.title || "",
        match: typeof m.match === "number" ? m.match : 0,
      })),
      createdAt: new Date(),
    };

    await db.collection("match_results").insertOne(doc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Match results POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
