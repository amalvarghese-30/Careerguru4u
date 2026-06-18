#!/usr/bin/env npx tsx
/**
 * Validate exported solutions from JSON files.
 *
 * Usage:
 *   npx tsx scripts/ingestion/cli/validate.ts
 *   npx tsx scripts/ingestion/cli/validate.ts --input=academic-library/solutions
 */
import * as fs from "fs";
import * as path from "path";
import { SOLUTIONS_DIR } from "../config";
import { runValidation, generateReport, printReport, saveReport } from "../validator";
import { getReviewQueue } from "../review";
import type { Solution } from "../types";

function loadSolutionsFromDir(dir: string): Solution[] {
  const solutions: Solution[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".json") && !entry.name.startsWith("_")) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
          if (data.board && data.solution) {
            solutions.push(data as Solution);
          }
        } catch {}
      }
    }
  }

  walk(dir);
  return solutions;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

  const inputDir = getArg("input") || SOLUTIONS_DIR;

  console.log("═".repeat(60));
  console.log("  CareerGuru4U — Solution Validator");
  console.log("═".repeat(60));
  console.log(`  Input: ${inputDir}`);

  const solutions = loadSolutionsFromDir(inputDir);
  console.log(`  Loaded: ${solutions.length} solutions`);

  if (solutions.length === 0) {
    console.log("  No solutions found to validate.");
    return;
  }

  const { allIssues, summary } = runValidation(solutions);
  const report = generateReport(allIssues, summary.total, summary.valid);
  printReport(report);

  const reportPath = saveReport(report);
  console.log(`  Report saved: ${reportPath}`);

  // Show review queue status
  const reviewQueue = getReviewQueue();
  const pendingReviews = reviewQueue.items.filter((i) => !i.reviewed).length;
  console.log(`  Pending reviews: ${pendingReviews}/${reviewQueue.items.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
