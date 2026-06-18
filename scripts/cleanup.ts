/**
 * CLI Entry Point: npm run cleanup
 *
 * Removes duplicate files, empty directories, and stale cache entries.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { OUTPUT_DIR } from "./crawler/config/index";
import { logger } from "./crawler/utils/logger";

function checksum(filePath: string): string {
  return crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex");
}

function main() {
  console.log("═".repeat(60));
  console.log("  Cleanup — Remove Duplicates & Empty Directories");
  console.log("═".repeat(60));

  const downloadsDir = path.join(process.cwd(), OUTPUT_DIR, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    logger.warn("No downloads directory found.");
    return;
  }

  let duplicatesRemoved = 0;
  let emptyDirsRemoved = 0;
  let spaceSaved = 0;

  // Find and remove duplicate PDFs by checksum
  const seenChecksums = new Map<string, string>();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fp);
      } else if (entry.name.endsWith(".pdf")) {
        try {
          const hash = checksum(fp);
          if (seenChecksums.has(hash)) {
            const stat = fs.statSync(fp);
            spaceSaved += stat.size;
            fs.unlinkSync(fp);
            duplicatesRemoved++;
            logger.info(`Removed duplicate: ${path.basename(fp)} (${formatSize(stat.size)})`);
          } else {
            seenChecksums.set(hash, fp);
          }
        } catch (err) {
          logger.warn(`Could not checksum: ${fp}`);
        }
      }
    }
  }

  walk(downloadsDir);

  // Remove empty directories (bottom-up)
  function removeEmptyDirs(dir: string): boolean {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let isEmpty = true;

    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (removeEmptyDirs(fp)) {
          fs.rmdirSync(fp);
          emptyDirsRemoved++;
        } else {
          isEmpty = false;
        }
      } else {
        isEmpty = false;
      }
    }

    return isEmpty;
  }

  removeEmptyDirs(downloadsDir);

  console.log(`\n  Duplicates removed: ${duplicatesRemoved}`);
  console.log(`  Empty directories removed: ${emptyDirsRemoved}`);
  console.log(`  Space saved: ${formatSize(spaceSaved)}`);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main();
