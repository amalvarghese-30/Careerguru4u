import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, class: studentClass, board, purpose, message } = body;

    if (!name || !phone || !email || !purpose) {
      return NextResponse.json({ error: "Name, phone, email, and purpose are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const result = await db.collection("counselling_requests").insertOne({
      userId: null,
      name,
      phone,
      email,
      class: studentClass || "",
      board: board || "",
      purpose: Array.isArray(purpose) ? purpose : [purpose],
      message: message || "",
      status: "pending",
      assignedTo: null,
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Counselling request submitted successfully",
      requestId: result.insertedId,
    });

  } catch (error) {
    console.error("Counselling request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
