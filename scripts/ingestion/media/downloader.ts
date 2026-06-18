/**
 * Image downloader — downloads detected images to local assets directory.
 */
import * as path from "path";
import { downloadFile } from "../crawler/fetcher";
import { ASSETS_DIR, MAX_PARALLEL_DOWNLOADS, DELAY_MS } from "../config";
import type { ImageRef } from "../types";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface DownloadResult {
  ref: ImageRef;
  success: boolean;
  localPath: string;
  size: number;
  error?: string;
}

/**
 * Download a single image.
 */
export async function downloadImage(ref: ImageRef, destDir: string): Promise<DownloadResult> {
  const ext = ref.mimeType.split("/")[1] || "png";
  const filename = `${ref.blockId}.${ext}`;
  const destPath = path.join(destDir, filename);

  const result = await downloadFile(ref.url, destPath);

  return {
    ref,
    success: result.success,
    localPath: result.success ? destPath : "",
    size: result.size,
    error: result.success ? undefined : `Failed to download ${ref.url}`,
  };
}

/**
 * Download images with concurrency control and rate limiting.
 */
export async function downloadImages(
  refs: ImageRef[],
  destDir: string
): Promise<DownloadResult[]> {
  const results: DownloadResult[] = [];
  const pending = [...refs];

  async function worker(): Promise<void> {
    while (pending.length > 0) {
      const ref = pending.shift();
      if (!ref) break;

      const result = await downloadImage(ref, destDir);
      results.push(result);
      await sleep(DELAY_MS);
    }
  }

  const workers = Array.from({ length: Math.min(MAX_PARALLEL_DOWNLOADS, refs.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
