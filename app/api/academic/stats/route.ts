import { NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");

    const [solutions, textbooks, conceptNotes, syllabus, mcqs, subjectsAgg] = await Promise.all([
      db.collection("solutions").countDocuments(),
      db.collection("textbooks").countDocuments(),
      db.collection("concept_notes").countDocuments(),
      db.collection("syllabus").countDocuments(),
      db.collection("mcq_questions").countDocuments(),
      db.collection("solutions").distinct("subject"),
      db.collection("solutions").distinct("chapter"),
    ]);

    return NextResponse.json({
      solutions,
      textbooks,
      conceptNotes,
      syllabus,
      mcqs,
      subjects: subjectsAgg.length,
      chapters: subjectsAgg.length,
    });
  } catch (error) {
    console.error("Academic stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
