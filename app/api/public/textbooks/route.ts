import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

/* ---------- GET: Public textbook search (no auth required) ---------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";
    const medium = searchParams.get("medium") || "";
    const isOfficial = searchParams.get("isOfficial");
    const limit = parseInt(searchParams.get("limit") || "100");

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};

    if (board) query.board = board;
    if (classNum) query.class = parseInt(classNum);
    if (medium) query.medium = medium;
    if (isOfficial === "true") query.isOfficial = true;

    if (subject) {
      const safeSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { subject: { $regex: safeSubject, $options: "i" } },
        { title: { $regex: safeSubject, $options: "i" } },
      ];
    }

    const textbooks = await db.collection("textbooks")
      .find(query)
      .sort({ class: 1, subject: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ textbooks });
  } catch (err) {
    console.error("Public textbooks GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}