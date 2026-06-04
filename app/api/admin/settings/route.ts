import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { settingsSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";

const DEFAULTS = {
  siteName: "CareerGuru4U",
  tagline: "Your AI-Powered Career Guide",
  siteUrl: "https://careerguru.com",
  metaDescription: "",
  language: "en",
  timezone: "Asia/Kolkata",
  primaryColor: "#4F46E5",
  secondaryColor: "#7C3AED",
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  address: "",
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  footerContent: "",
  logo: "",
  favicon: "",
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");
    const settings = await db.collection("site_settings").findOne({ type: "main" });

    return NextResponse.json({
      settings: settings
        ? { ...DEFAULTS, ...settings, _id: undefined, password: undefined }
        : DEFAULTS,
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const validation = settingsSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const update = { ...validation.data, updatedAt: new Date() };
    await db.collection("site_settings").updateOne(
      { type: "main" },
      { $set: update },
      { upsert: true }
    );

    await logAudit({
      action: "UPDATE", collection: "site_settings", documentId: "main",
      performedBy: admin.userId, performedByEmail: admin.email, changes: update,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
