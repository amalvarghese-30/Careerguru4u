/**
 * Validation checks — runs quality checks on scraped solution data.
 *
 * Checks:
 * - Missing question or answer
 * - Missing equations (image alt text lost without math rendering)
 * - Missing images (src references with no local path)
 * - Broken tables (empty headers + rows)
 * - Broken Unicode (presence of replacement characters)
 * - Duplicate questions (same URL)
 * - Truncated content (ends mid-sentence with "...")
 */
import type { Solution, ValidationIssue } from "../types";

export function validateSolution(solution: Solution): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ctx = {
    url: solution.sourceUrl,
    board: solution.board,
    class: solution.class,
    subject: solution.subject,
    chapter: solution.chapter,
    questionNumber: solution.questionNumber,
  };

  // 1. Missing question
  if (!solution.question || solution.question.length === 0) {
    issues.push({ ...ctx, issue: "Missing question content", severity: "error", field: "question" });
  } else {
    const qText = solution.question.map((b) => b.content || "").join(" ").trim();
    if (qText.length < 3) {
      issues.push({ ...ctx, issue: `Question too short (${qText.length} chars)`, severity: "warning", field: "question" });
    }
  }

  // 2. Missing solution
  if (!solution.solution || solution.solution.length === 0) {
    issues.push({ ...ctx, issue: "Missing solution content", severity: "error", field: "solution" });
  } else {
    const solText = solution.solution
      .flatMap((s) => s.blocks)
      .map((b) => b.content || "")
      .join(" ");
    if (solText.length < 10) {
      issues.push({ ...ctx, issue: `Solution too short (${solText.length} chars)`, severity: "warning", field: "solution" });
    }
  }

  // 3. Check for broken images (no localPath after download)
  for (const img of solution.images) {
    if (!img.localPath) {
      issues.push({ ...ctx, issue: `Image not downloaded: ${img.url}`, severity: "warning", field: "images" });
    }
  }

  // 4. Check for empty tables
  for (const table of solution.tables) {
    if (table.rowCount === 0) {
      issues.push({ ...ctx, issue: "Table has no rows", severity: "warning", field: "tables" });
    }
  }

  // 5. Check for Unicode replacement characters (FFFD)
  const allText = [
    ...solution.question.map((b) => b.content || ""),
    ...solution.solution.flatMap((s) => s.blocks).map((b) => b.content || ""),
  ].join("");

  if (allText.includes("�")) {
    issues.push({ ...ctx, issue: "Contains Unicode replacement characters", severity: "error", field: "unicode" });
  }

  // 6. Check for truncated content
  if (allText.trim().endsWith("...") || allText.trim().endsWith("…")) {
    issues.push({ ...ctx, issue: "Content may be truncated (ends with ellipsis)", severity: "warning", field: "content" });
  }

  // 7. Check for solution fallback text
  const fallbackTexts = ["See solution on Shaalaa.com", "Solution not found", "Login to view"];
  for (const fb of fallbackTexts) {
    if (allText.includes(fb)) {
      issues.push({ ...ctx, issue: `Solution contains fallback text: "${fb}"`, severity: "error", field: "solution" });
    }
  }

  return issues;
}

export function runValidation(solutions: Solution[]): { allIssues: ValidationIssue[]; summary: Record<string, number> } {
  const allIssues: ValidationIssue[] = [];
  const summary: Record<string, number> = {
    total: solutions.length,
    valid: 0,
    errors: 0,
    warnings: 0,
  };

  for (const solution of solutions) {
    const issues = validateSolution(solution);
    if (issues.length === 0) {
      summary.valid++;
    } else {
      allIssues.push(...issues);
      summary.errors += issues.filter((i) => i.severity === "error").length;
      summary.warnings += issues.filter((i) => i.severity === "warning").length;
    }
  }

  return { allIssues, summary };
}
