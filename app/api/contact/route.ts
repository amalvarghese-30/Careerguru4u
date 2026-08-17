import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Contact form spam protection: 5 messages per 10 minutes per IP
    const rl = rateLimit(`contact:${getClientIp(req)}`, { windowMs: 10 * 60_000, max: 5 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const result = await db.collection("contact_messages").insertOne({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || "").trim(),
      message: message.trim(),
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
