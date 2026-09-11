import { v2 as cloudinary } from "cloudinary";

/**
 * Magic bytes signatures for file type validation.
 * Maps MIME type to array of possible magic byte sequences.
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a, GIF89a
  "image/webp": [[0x52, 0x49, 0x46, 0x46, /* size */ 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]], // RIFF....WEBP
  "image/bmp": [[0x42, 0x4d]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46, 0x2d]], // %PDF-
};

/**
 * Validates file content against expected magic bytes for the declared MIME type.
 * @param buffer The file buffer to check
 * @param expectedMimeType The MIME type the file should be
 * @returns true if magic bytes match, false otherwise
 */
export function validateMagicBytes(buffer: Buffer, expectedMimeType: string): boolean {
  const signatures = MAGIC_BYTES[expectedMimeType];
  if (!signatures) return false; // Unknown type, reject

  for (const sig of signatures) {
    let matches = true;
    for (let i = 0; i < sig.length; i++) {
      if (i >= buffer.length) {
        matches = false;
        break;
      }
      // Special case: WebP has variable size bytes at positions 4-7
      if (expectedMimeType === "image/webp" && i >= 4 && i <= 7) continue;
      if (buffer[i] !== sig[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

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
  file: File,
  buffer?: Buffer
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
  // Magic bytes validation if buffer provided
  if (buffer) {
    if (!validateMagicBytes(buffer, file.type)) {
      return {
        valid: false,
        error: `File content does not match declared type "${file.type}". Possible malicious file.`,
      };
    }
  }
  return { valid: true };
}
