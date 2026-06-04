import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");
    const settings = await db.collection("site_settings").findOne({ type: "main" });

    return NextResponse.json({
      settings: settings || {
        siteName: "CareerGuru4U",
        tagline: "Your AI-Powered Career Guide",
        siteUrl: "https://careerguru.com",
        metaDescription: "CareerGuru4U helps students find the right career path with AI-powered guidance, college comparisons, and expert counselling.",
        language: "en",
        timezone: "Asia/Kolkata",
        primaryColor: "#4F46E5",
        secondaryColor: "#7C3AED",
        contactEmail: "",
        contactPhone: "",
        whatsappNumber: "",
        address: "",
        socialLinks: {},
        footerContent: "",
        logo: "",
        favicon: "",
      },
    });
  } catch (error) {
    console.error("Site settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
