/**
 * CLI Entry Point: npm run verify
 *
 * Verifies downloaded files: checks existence, size, and basic integrity.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { OUTPUT_DIR } from "./crawler/config/index";
import { logger } from "./crawler/utils/logger";

function checksum(filePath: string): string {
  return crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function main() {
  console.log("═".repeat(60));
  console.log("  Verify Downloaded Files");
  console.log("═".repeat(60));

  const downloadsDir = path.join(process.cwd(), OUTPUT_DIR, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    logger.warn("No downloads directory found.");
    return;
  }

  let totalFiles = 0;
  let validFiles = 0;
  let corruptFiles = 0;
  let emptyFiles = 0;

  const results: Array<{ path: string; size: number; checksum: string; valid: boolean }> = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fp);
      } else if (entry.name.endsWith(".pdf") || entry.name.endsWith(".jpg") || entry.name.endsWith(".png")) {
        totalFiles++;
        const stat = fs.statSync(fp);

        if (stat.size === 0) {
          emptyFiles++;
          results.push({ path: fp, size: 0, checksum: "", valid: false });
          logger.warn(`Empty: ${fp}`);
          continue;
        }

        // PDFs less than 1KB are likely error pages
        if (entry.name.endsWith(".pdf") && stat.size < 1024) {
          corruptFiles++;
          results.push({ path: fp, size: stat.size, checksum: "", valid: false });
          logger.warn(`Corrupt: ${fp} (${formatSize(stat.size)})`);
          continue;
        }

        try {
          const hash = checksum(fp);
          results.push({ path: fp, size: stat.size, checksum: hash, valid: true });
          validFiles++;
        } catch {
          corruptFiles++;
          results.push({ path: fp, size: stat.size, checksum: "", valid: false });
          logger.warn(`Unreadable: ${fp}`);
        }
      }
    }
  }

  walk(downloadsDir);

  // Save verification report
  const reportDir = path.join(process.cwd(), OUTPUT_DIR, "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, "verify.json"),
    JSON.stringify({ totalFiles, validFiles, corruptFiles, emptyFiles, results }, null, 2)
  );

  console.log(`\n  Total files: ${totalFiles}`);
  console.log(`  Valid: ${validFiles}`);
  console.log(`  Corrupt: ${corruptFiles}`);
  console.log(`  Empty: ${emptyFiles}`);
  console.log(`\n  Report saved to: ${OUTPUT_DIR}/reports/verify.json`);
}

main();
