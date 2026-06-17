/**
 * Utility to clean up and normalize scraped solution data before import.
 * Run: npx tsx scripts/cleanup-solutions.ts
 */
import fs from "fs";
import path from "path";
import { decode } from "html-entities";

interface RawSolution {
  question: string;
  answer: string;
  questionNumber?: number;
  chapter?: string;
  subject?: string;
  class?: number;
  board?: string;
}

interface CleanedSolution {
  question: string;
  answer: string;
  questionNumber: number;
  chapter: string;
  subject: string;
  class: number;
  board: string;
  isFree: boolean;
  createdAt: string;
}

// Subject name normalization map
const SUBJECT_FIXES: Record<string, string> = {
  "Mathmetics": "Mathematics",
  "mathmetics": "Mathematics",
  "Science and Tech": "Science and Technology",
  "science-and-tech": "Science and Technology",
  "Sci & Tech": "Science and Technology",
  "mathematics-1-algebra": "Mathematics (Algebra)",
  "algebra-9th-mathematics-1": "Mathematics (Algebra)",
  "geometry-mathematics-2": "Mathematics (Geometry)",
  "geography-social-science-2-9th": "Geography",
  "history-political-science-social-science-1": "History and Political Science",
};

const BOARD_MAP: Record<string, string> = {
  "maharashtra": "Maharashtra Board",
  "mh": "Maharashtra Board",
  "msbshse": "Maharashtra Board",
};

function cleanText(text: string): string {
  if (!text) return "";
  // Decode all HTML entities
  let cleaned = decode(text, { level: "html5" });
  // Normalize whitespace
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Remove excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  // Trim
  cleaned = cleaned.trim();
  return cleaned;
}

function cleanSolution(raw: RawSolution, fallbackSubject: string, fallbackClass: number): CleanedSolution {
  return {
    question: cleanText(raw.question),
    answer: cleanText(raw.answer),
    questionNumber: raw.questionNumber ?? 0,
    chapter: raw.chapter ?? "General",
    subject: SUBJECT_FIXES[raw.subject ?? ""] ?? raw.subject ?? fallbackSubject,
    class: raw.class ?? fallbackClass,
    board: BOARD_MAP[raw.board?.toLowerCase() ?? ""] ?? raw.board ?? "Maharashtra Board",
    isFree: true,
    createdAt: new Date().toISOString(),
  };
}

function walkSolutions(dir: string): void {
  const solutions: CleanedSolution[] = [];
  let errors = 0;
  let cleaned = 0;

  const classMatch = dir.match(/(\d+)$/);
  const fallbackClass = classMatch ? parseInt(classMatch[1]) : 10;

  function walk(current: string) {
    if (!fs.existsSync(current)) return;

    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === "solutions.json" || entry.name.endsWith(".json")) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
          const items = Array.isArray(data) ? data : [data];
          const folderName = path.basename(path.dirname(fullPath));

          for (const item of items) {
            try {
              const cleanedSol = cleanSolution(item, folderName, fallbackClass);
              solutions.push(cleanedSol);
              cleaned++;
            } catch {
              errors++;
            }
          }
        } catch {
          errors++;
        }
      }
    }
  }

  walk(dir);

  if (solutions.length > 0) {
    const outPath = path.join(dir, "cleaned-solutions.json");
    fs.writeFileSync(outPath, JSON.stringify(solutions, null, 2), "utf-8");
  }

  console.log(`Processed ${dir}:`);
  console.log(`  Solutions: ${solutions.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Subject fixes applied: ${Object.keys(SUBJECT_FIXES).length} mappings`);
}

// Run
const dataDir = process.argv[2] || "scraped-data";

if (!fs.existsSync(dataDir)) {
  console.error(`Directory not found: ${dataDir}`);
  process.exit(1);
}

const boardDirs = fs.readdirSync(dataDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => path.join(dataDir, e.name));

for (const boardDir of boardDirs) {
  const classDirs = fs.readdirSync(boardDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(boardDir, e.name));

  for (const classDir of classDirs) {
    walkSolutions(classDir);
  }
}

console.log("\nCleanup complete. Run with: npx tsx scripts/cleanup-solutions.ts");
