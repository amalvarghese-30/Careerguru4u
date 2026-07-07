import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { uploadToCloudinary, deleteFromCloudinary, generateKey, validateUpload } from "@/lib/storage/cloudinary";

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const fileName = file.name || "file";
    const key = generateKey(folder, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToCloudinary(key, buffer, file.type);

    return NextResponse.json({ url, key, fileName, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    await deleteFromCloudinary(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete from Cloudinary error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
