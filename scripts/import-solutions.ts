/**
 * Import scraped solutions JSON into MongoDB.
 *
 * Usage:
 *   npx tsx scripts/import-solutions.ts academic-library/solutions/maharashtra_class10_all_1781742441795.json
 */
import * as fs from "fs";
import * as path from "path";

// Load .env.local BEFORE any imports that depend on process.env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-solutions.ts <path-to-solutions.json>");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  console.log(`Reading ${absPath}...`);
  const raw = fs.readFileSync(absPath, "utf-8");
  const solutions = JSON.parse(raw);

  if (!Array.isArray(solutions) || solutions.length === 0) {
    console.error("File does not contain a valid solutions array");
    process.exit(1);
  }

  console.log(`Found ${solutions.length} solutions`);

  // Dynamic import after env is loaded
  const { default: clientPromise } = await import("../lib/db/mongodb");
  const client = await clientPromise;
  const db = client.db("career_guru");
  const collection = db.collection("solutions");

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < solutions.length; i++) {
    const sol = solutions[i];
    try {
      // Dedup: prefer sourceUrl if available, otherwise use compound key
      const existing = sol.sourceUrl
        ? await collection.findOne({ sourceUrl: sol.sourceUrl })
        : await collection.findOne({
            board: normalizeBoard(sol.board),
            class: sol.class,
            subject: sol.subject,
            chapter: typeof sol.chapter === "string" ? cleanHtmlEntities(sol.chapter) : sol.chapter,
            questionNumber: sol.questionNumber,
          });

      if (existing) {
        skipped++;
        if (i % 500 === 0) process.stdout.write(`\r  ${i + 1}/${solutions.length} — ${inserted} new, ${skipped} skipped, ${failed} failed`);
        continue;
      }

      const doc = {
        board: normalizeBoard(sol.board),
        class: sol.class,
        subject: sol.subject,
        chapter: typeof sol.chapter === "string" ? cleanHtmlEntities(sol.chapter) : sol.chapter,
        questionNumber: sol.questionNumber,
        sourceUrl: sol.sourceUrl,
        sourceType: sol.sourceType || "scraped",
        question: typeof sol.question === "string" ? sol.question : contentBlocksToText(sol.question),
        answer: extractAnswerText(sol.solution),
        questionBlocks: Array.isArray(sol.question) ? sol.question : [],
        solutionSteps: Array.isArray(sol.solution) ? sol.solution : [],
        questionType: sol.questionType || undefined,
        difficulty: sol.difficulty || undefined,
        images: sol.images || [],
        tables: sol.tables || [],
        equations: sol.equations || [],
        version: sol.version || 1,
        isFree: sol.isFree ?? true,
        viewCount: sol.viewCount || 0,
        helpfulCount: sol.helpfulCount || 0,
        createdAt: sol.createdAt ? new Date(sol.createdAt) : new Date(),
        updatedAt: sol.updatedAt ? new Date(sol.updatedAt) : new Date(),
      };

      await collection.insertOne(doc);
      inserted++;

      if (i % 100 === 0) {
        process.stdout.write(`\r  ${i + 1}/${solutions.length} — ${inserted} new, ${skipped} skipped, ${failed} failed`);
      }
    } catch (err) {
      failed++;
      console.error(`\n  Failed Q#${sol.questionNumber}: ${(err as Error).message}`);
    }
  }

  console.log(`\n\nDone: ${inserted} inserted, ${skipped} already existed, ${failed} failed`);
  process.exit(0);
}

function normalizeBoard(board: string): string {
  const mapping: Record<string, string> = {
    maharashtra: "Maharashtra Board",
    cbse: "CBSE",
    icse: "ICSE",
  };
  return mapping[board.toLowerCase()] || board;
}

function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&bull;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contentBlocksToText(blocks: unknown): string {
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b: { type?: string; content?: string; children?: unknown[] }) => {
      if (b.content) return b.content;
      if (b.children && Array.isArray(b.children)) return contentBlocksToText(b.children);
      return "";
    })
    .join(" ")
    .trim();
}

function extractAnswerText(solution: unknown): string {
  if (typeof solution === "string") return solution;
  if (Array.isArray(solution)) {
    return solution
      .map((step: { blocks?: Array<{ content?: string }> }) => {
        if (step.blocks) {
          return step.blocks.map((b) => b.content || "").join(" ");
        }
        return "";
      })
      .join("\n\n")
      .trim();
  }
  return "";
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
