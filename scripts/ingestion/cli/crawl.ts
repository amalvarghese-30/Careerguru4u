#!/usr/bin/env npx tsx
/**
 * CLI Entry Point: Content Ingestion Crawler
 *
 * Usage:
 *   npx tsx scripts/ingestion/cli/crawl.ts
 *   npx tsx scripts/ingestion/cli/crawl.ts --board=maharashtra --class=10
 *   npx tsx scripts/ingestion/cli/crawl.ts --board=cbse --class=9 --subject=physics
 *   npx tsx scripts/ingestion/cli/crawl.ts --discover-only
 *   npx tsx scripts/ingestion/cli/crawl.ts --board=maharashtra --class=10 --resume
 */
import { runPipeline } from "../pipeline";
import { exportToJson } from "../export";
import { generateReport, printReport } from "../validator";
import { runValidation } from "../validator";
import type { BoardKey, Solution } from "../types";

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  const hasFlag = (name: string) => args.includes(`--${name}`);

  const board = getArg("board") as BoardKey | undefined;
  const classNum = getArg("class") ? parseInt(getArg("class")!) : undefined;
  const subject = getArg("subject");
  const discoverOnly = hasFlag("discover-only");
  const resume = hasFlag("resume");

  console.log("═".repeat(60));
  console.log("  CareerGuru4U — Content Ingestion Engine");
  console.log("═".repeat(60));
  if (board) console.log(`  Board: ${board}`);
  if (classNum) console.log(`  Class: ${classNum}`);
  if (subject) console.log(`  Subject: ${subject}`);
  if (discoverOnly) console.log("  Mode: Discover only");
  if (resume) console.log("  Mode: Resume");
  console.log("═".repeat(60));

  const startTime = Date.now();

  const { solutions, stats } = await runPipeline({
    board,
    class: classNum,
    subject,
    discoverOnly,
    resume,
    onProgress: (phase, done, total, label) => {
      if (total > 0) {
        console.log(`  [${phase}] ${done}/${total} — ${label}`);
      } else {
        console.log(`  [${phase}] ${label}`);
      }
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("  Results");
  console.log("═".repeat(60));
  console.log(`  Boards    : ${stats.boardsFound}`);
  console.log(`  Classes   : ${stats.classesFound}`);
  console.log(`  Subjects  : ${stats.subjectsFound}`);
  console.log(`  Books     : ${stats.booksFound}`);
  console.log(`  Chapters  : ${stats.chaptersFound}`);
  console.log(`  Questions : ${stats.questionsFound}`);
  console.log(`  Solutions : ${stats.solutionsScraped}`);
  console.log(`  Valid     : ${stats.solutionsValid}`);
  console.log(`  Issues    : ${stats.solutionsWithIssues}`);
  console.log(`  Errors    : ${stats.errors.length}`);
  console.log(`  Time      : ${elapsed}s`);
  console.log("═".repeat(60));

  if (solutions.length > 0) {
    console.log("\n  Running validation on all solutions...");
    const { allIssues, summary } = runValidation(solutions);
    const report = generateReport(allIssues, summary.total, summary.valid);
    printReport(report);

    // Export
    console.log("\n  Exporting solutions to JSON...");
    const exportPath = exportToJson(solutions);
    console.log(`  Exported ${solutions.length} solutions to ${exportPath}`);
  }

  if (stats.errors.length > 0) {
    console.log("\n  Errors encountered:");
    for (const err of stats.errors) {
      console.log(`    - ${err}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
