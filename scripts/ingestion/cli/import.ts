#!/usr/bin/env npx tsx
/**
 * Import structured solutions into MongoDB.
 *
 * Usage:
 *   npx tsx scripts/ingestion/cli/import.ts
 *   npx tsx scripts/ingestion/cli/import.ts --input=academic-library/solutions
 *   npx tsx scripts/ingestion/cli/import.ts --dry-run
 */
import * as fs from "fs";
import * as path from "path";
import { SOLUTIONS_DIR, OUTPUT_DIR } from "../config";
import { importToMongoDB } from "../export/mongodb";
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
  const dryRun = args.includes("--dry-run");

  const inputDir = getArg("input") || SOLUTIONS_DIR;

  console.log("═".repeat(60));
  console.log("  CareerGuru4U — MongoDB Import");
  console.log("═".repeat(60));
  console.log(`  Input: ${inputDir}`);
  if (dryRun) console.log("  Mode: Dry run (no database writes)");

  const solutions = loadSolutionsFromDir(inputDir);
  console.log(`  Loaded: ${solutions.length} solutions`);

  if (solutions.length === 0) {
    console.log("  No solutions found to import.");
    return;
  }

  // Show summary
  const bySubject: Record<string, number> = {};
  for (const s of solutions) {
    const key = `${s.board}/${s.class}/${s.subject}`;
    bySubject[key] = (bySubject[key] || 0) + 1;
  }
  console.log("\n  By subject:");
  for (const [key, count] of Object.entries(bySubject)) {
    console.log(`    ${key}: ${count}`);
  }

  if (dryRun) {
    console.log("\n  Dry run complete. Remove --dry-run to import.");
    return;
  }

  console.log("\n  Importing to MongoDB...");
  const result = await importToMongoDB(solutions);
  console.log(`  Inserted : ${result.inserted}`);
  console.log(`  Updated  : ${result.updated}`);
  console.log(`  Skipped  : ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log(`  Errors   : ${result.errors.length}`);
    for (const err of result.errors) {
      console.log(`    - ${err}`);
    }
  }
  console.log("  Import complete.");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
