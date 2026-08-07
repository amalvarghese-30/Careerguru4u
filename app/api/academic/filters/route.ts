// app/api/academic/filters/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");
    const col = db.collection("solutions");

    // Level 1: Board specified → return classes 1-12 that have solutions
    if (board && !classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board } },
          { $group: { _id: "$class", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      const classes: number[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const cls = row._id as number;
        classes.push(cls);
        counts[String(cls)] = row.count;
      }
      return NextResponse.json({ classes, counts });
    }

    // Level 2: Board + Class specified → return distinct subjects
    if (board && classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum) } },
          { $group: { _id: "$subject", count: { $sum: 1 } } },
        ])
        .toArray();

      const subjects: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const subj = row._id as string;
        subjects.push(subj);
        counts[subj] = row.count;
      }
      subjects.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      return NextResponse.json({ subjects, counts });
    }

    // Level 3: Board + Class + Subject specified → return distinct chapters
    if (board && classNum && subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum), subject } },
          { $group: { _id: "$chapter", count: { $sum: 1 } } },
        ])
        .toArray();

      const chapters: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const ch = row._id as string;
        chapters.push(ch);
        counts[ch] = row.count;
      }
      chapters.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      return NextResponse.json({ chapters, counts });
    }

    return NextResponse.json({ error: "Provide at least a board parameter" }, { status: 400 });
  } catch (error) {
    console.error("Academic filters GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
