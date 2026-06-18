/**
 * CLI Entry Point: npm run resume
 *
 * Resumes a previous crawl from the last checkpoint.
 */
import { cache } from "./crawler/utils/cache";
import { logger } from "./crawler/utils/logger";
import { getStats, generateReport } from "./crawler/modules/reporter";
import { closeBrowser } from "./crawler/utils/browser";
import fs from "fs";
import path from "path";
import { OUTPUT_DIR } from "./crawler/config/index";

async function main() {
  console.log("═".repeat(60));
  console.log("  Resume Previous Crawl");
  console.log("═".repeat(60));

  const checkpoint = cache.loadCheckpoint<{
    lastTaskIndex: number;
    totalSolutions: number;
    completedAt: string;
  }>("crawl-progress");

  if (!checkpoint) {
    console.log("\n  No checkpoint found. Starting a new crawl...");
    console.log("  Run: npm run crawl");
    return;
  }

  console.log(`\n  Last checkpoint: ${checkpoint.completedAt}`);
  console.log(`  Completed up to task #${checkpoint.lastTaskIndex}`);
  console.log(`  Solutions scraped: ${checkpoint.totalSolutions}`);

  // Re-run crawl from where we left off
  // The crawl.ts script will skip visited pages via the cache
  console.log("\n  ⚠️ Resume logic: re-run crawl to continue from checkpoint");
  console.log("  Visited pages in cache will be skipped automatically.");
  console.log("  Run: npm run crawl (it will skip already-visited pages)");

  await closeBrowser();
  generateReport(getStats());
}

main().catch(console.error);
