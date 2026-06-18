#!/usr/bin/env npx tsx
/**
 * Resume a previously interrupted crawl from the most recent checkpoint.
 *
 * Usage:
 *   npx tsx scripts/ingestion/cli/resume.ts
 *   npx tsx scripts/ingestion/cli/resume.ts --checkpoint=maharashtra_10
 */
import { listCheckpoints, loadCheckpoint } from "../crawler/cache";
import { runPipeline } from "../pipeline";
import { exportToJson } from "../export";
import { runValidation, generateReport, printReport } from "../validator";

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

  // List available checkpoints
  const checkpoints = listCheckpoints();
  if (checkpoints.length === 0) {
    console.log("No checkpoints found. Run crawl first.");
    return;
  }

  console.log("═".repeat(60));
  console.log("  CareerGuru4U — Resume Crawl");
  console.log("═".repeat(60));
  console.log(`  Available checkpoints: ${checkpoints.length}`);
  for (const cp of checkpoints) {
    const data = loadCheckpoint(cp);
    if (data) {
      console.log(`    ${cp} — ${data.timestamp} (${data.stats.solutionsFound} solutions, phase: ${data.phase})`);
    }
  }

  const specificCheckpoint = getArg("checkpoint");
  if (specificCheckpoint) {
    const cp = loadCheckpoint(specificCheckpoint);
    if (!cp) {
      console.log(`Checkpoint not found: ${specificCheckpoint}`);
      return;
    }
    console.log(`\n  Resuming from: ${specificCheckpoint}`);
  }

  console.log("\n  Starting resume...");
  const startTime = Date.now();

  const { solutions, stats } = await runPipeline({
    board: specificCheckpoint ? (loadCheckpoint(specificCheckpoint)?.board as any) : undefined,
    resume: true,
    onProgress: (phase, done, total, label) => {
      if (total > 0) {
        console.log(`  [${phase}] ${done}/${total} — ${label}`);
      } else {
        console.log(`  [${phase}] ${label}`);
      }
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Resume complete in ${elapsed}s`);
  console.log(`  New solutions: ${solutions.length}`);
  console.log(`  Total scraped: ${stats.solutionsScraped}`);

  if (solutions.length > 0) {
    console.log("\n  Running validation...");
    const { allIssues, summary } = runValidation(solutions);
    const report = generateReport(allIssues, summary.total, summary.valid);
    printReport(report);

    console.log("  Exporting solutions to JSON...");
    exportToJson(solutions);
    console.log("  Done.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
