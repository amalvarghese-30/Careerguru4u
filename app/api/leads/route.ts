import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, source, interest, class: cls, board, city } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const result = await db.collection("leads").insertOne({
      name,
      email,
      phone: phone || "",
      source: source || "Website",
      interest: interest || "",
      class: cls || "",
      board: board || "",
      city: city || "",
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Public lead POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
