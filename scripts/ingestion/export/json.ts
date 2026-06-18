/**
 * JSON export — saves structured solutions to disk as JSON files.
 */
import * as fs from "fs";
import * as path from "path";
import { SOLUTIONS_DIR } from "../config";
import type { Solution } from "../types";

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function saveSolutionToFile(solution: Solution): string {
  const dir = path.join(
    SOLUTIONS_DIR,
    solution.board,
    String(solution.class),
    solution.subject,
    solution.chapter
  );
  ensureDir(dir);

  const filename = `q_${solution.questionNumber || solution._id || Date.now().toString(36)}.json`;
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, JSON.stringify(solution, null, 2), "utf-8");
  return dest;
}

export function exportToJson(solutions: Solution[], outputDir?: string): string {
  const destDir = outputDir || SOLUTIONS_DIR;
  ensureDir(destDir);

  let count = 0;
  for (const solution of solutions) {
    saveSolutionToFile(solution);
    count++;
  }

  const indexPath = path.join(destDir, "_index.json");
  const index = solutions.map((s) => ({
    board: s.board,
    class: s.class,
    subject: s.subject,
    chapter: s.chapter,
    questionNumber: s.questionNumber,
    sourceUrl: s.sourceUrl,
    questionType: s.questionType,
    difficulty: s.difficulty,
  }));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");

  return destDir;
}
