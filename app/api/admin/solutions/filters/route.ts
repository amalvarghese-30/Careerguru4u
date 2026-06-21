import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"] as const;

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");
    const col = db.collection("solutions");

    // Level 1: Return all boards with counts (always all 3, even if empty)
    if (!board && !classNum && !subject) {
      const result = await col
        .aggregate([
          { $group: { _id: "$board", count: { $sum: 1 } } },
        ])
        .toArray();

      const counts: Record<string, number> = {};
      for (const row of result) {
        counts[row._id as string] = row.count;
      }
      // Always return all 3 boards so empty ones still show
      const boards = [...BOARDS];
      for (const b of boards) {
        if (!(b in counts)) counts[b] = 0;
      }
      return NextResponse.json({ boards, counts });
    }

    // Level 2: Board selected → return all classes 1-10 with counts
    if (board && !classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board } },
          { $group: { _id: "$class", count: { $sum: 1 } } },
        ])
        .toArray();

      const counts: Record<string, number> = {};
      for (const row of result) {
        counts[String(row._id as number)] = row.count;
      }
      // Always return all classes 1-10 so empty ones still show
      const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const c of classes) {
        if (!(String(c) in counts)) counts[String(c)] = 0;
      }
      return NextResponse.json({ classes, counts });
    }

    // Level 3: Board + Class selected → return subjects with counts
    if (board && classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum) } },
          { $group: { _id: "$subject", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      const subjects: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const subj = row._id as string;
        subjects.push(subj);
        counts[subj] = row.count;
      }
      return NextResponse.json({ subjects, counts });
    }

    // Level 4: Board + Class + Subject selected → return chapters with counts
    if (board && classNum && subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum), subject } },
          { $group: { _id: "$chapter", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      const chapters: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const ch = row._id as string;
        chapters.push(ch);
        counts[ch] = row.count;
      }
      return NextResponse.json({ chapters, counts });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("Admin solutions filters GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
