/**
 * Playwright-based scraper CLI for JS-heavy pages.
 *
 * Usage:
 *   npx tsx scripts/scrape-playwright.ts --board cbse --class 10 --subject science
 *   npx tsx scripts/scrape-playwright.ts --board maharashtra --class 8 --subject mathematics --discover-only
 *   npx tsx scripts/scrape-playwright.ts --board cbse --class 10 --subject science --resume
 */
import { runPipeline } from "./ingestion/pipeline";
import { closeBrowser } from "./crawler/utils/browser";
import type { BoardKey } from "./ingestion/types";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);

function parseArg(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

async function main() {
  const board = (parseArg("--board") || "cbse") as BoardKey;
  const classNum = parseInt(parseArg("--class") || "10");
  const subject = parseArg("--subject") || "";
  const parallel = parseInt(parseArg("--parallel") || "4");
  const discoverOnly = hasFlag("--discover-only");
  const resume = hasFlag("--resume");

  console.log("=".repeat(60));
  console.log(" CareerGuru4U — Playwright Scraper");
  console.log("=".repeat(60));
  console.log(` Board:    ${board}`);
  console.log(` Class:    ${classNum}`);
  console.log(` Subject:  ${subject || "all"}`);
  console.log(` Parallel: ${parallel}`);
  console.log(` Discover: ${discoverOnly ? "only" : "full scrape"}`);
  console.log(` Resume:   ${resume ? "yes" : "no"}`);
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    const { solutions, stats } = await runPipeline({
      board,
      class: classNum,
      subject: subject || undefined,
      parallel,
      discoverOnly,
      resume,
      usePlaywright: true,
      onProgress: (phase, done, total, label) => {
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        console.log(`  [${phase}] ${pct}% — ${label}`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n" + "=".repeat(60));
    console.log(" Results");
    console.log("=".repeat(60));
    console.log(` Boards:        ${stats.boardsFound}`);
    console.log(` Classes:       ${stats.classesFound}`);
    console.log(` Subjects:      ${stats.subjectsFound}`);
    console.log(` Books:         ${stats.booksFound}`);
    console.log(` Chapters:      ${stats.chaptersFound}`);
    console.log(` Questions:     ${stats.questionsFound}`);
    console.log(` Scraped:       ${stats.solutionsScraped}`);
    console.log(` Valid:         ${stats.solutionsValid}`);
    console.log(` With issues:   ${stats.solutionsWithIssues}`);
    console.log(` Errors:        ${stats.errors.length}`);
    console.log(` Time:          ${elapsed}s`);

    if (stats.errors.length > 0 && stats.errors.length <= 10) {
      console.log("\n Errors:");
      stats.errors.forEach((e) => console.log(`   - ${e}`));
    } else if (stats.errors.length > 10) {
      console.log(`\n Errors (first 10 of ${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach((e) => console.log(`   - ${e}`));
    }

    // Save results
    if (solutions.length > 0) {
      const outDir = path.join("academic-library", "solutions");
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `${board}_class${classNum}_${subject || "all"}_${Date.now()}.json`);
      fs.writeFileSync(outPath, JSON.stringify(solutions, null, 2));
      console.log(`\n Saved ${solutions.length} solutions to ${outPath}`);
    }
  } catch (err) {
    console.error("\n Fatal error:", (err as Error).message);
    process.exit(1);
  } finally {
    await closeBrowser();
    console.log("\n Browser closed.");
  }
}

main();
