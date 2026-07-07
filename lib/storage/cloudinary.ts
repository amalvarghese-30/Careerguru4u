import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configure(): void {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export async function uploadToCloudinary(
  publicId: string,
  buffer: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  configure();

  const base64 = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    resource_type: "auto",
    type: "upload",
    access_mode: "public",
    overwrite: true,
  });

  return result.secure_url;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  configure();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "auto",
  });
}

export function generateKey(folder: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  return `${folder}/${timestamp}-${safeName}`;
}

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
]);
const PDF_TYPE = "application/pdf";

const ALLOWED_TYPES = new Set([...IMAGE_TYPES, PDF_TYPE]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateUpload(
  file: File
): { valid: false; error: string } | { valid: true } {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Accepted: images and PDFs.`,
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
    };
  }
  return { valid: true };
}
