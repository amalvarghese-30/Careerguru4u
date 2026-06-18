/**
 * Validation reporter — generates JSON reports and prints summaries.
 */
import * as fs from "fs";
import * as path from "path";
import { REPORTS_DIR } from "../config";
import type { ValidationIssue } from "../types";

export interface ValidationReport {
  generatedAt: string;
  totalSolutions: number;
  valid: number;
  totalIssues: number;
  errors: number;
  warnings: number;
  issuesByField: Record<string, number>;
  issues: ValidationIssue[];
}

export function generateReport(
  allIssues: ValidationIssue[],
  totalSolutions: number,
  valid: number
): ValidationReport {
  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warning").length;

  const issuesByField: Record<string, number> = {};
  for (const issue of allIssues) {
    issuesByField[issue.field] = (issuesByField[issue.field] || 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalSolutions,
    valid,
    totalIssues: allIssues.length,
    errors,
    warnings,
    issuesByField,
    issues: allIssues,
  };
}

export function printReport(report: ValidationReport): void {
  console.log("\n═══════════════════════════════════════");
  console.log("  Validation Report");
  console.log("═══════════════════════════════════════");
  console.log(`  Total solutions : ${report.totalSolutions}`);
  console.log(`  Valid           : ${report.valid} (${((report.valid / report.totalSolutions) * 100).toFixed(1)}%)`);
  console.log(`  Issues          : ${report.totalIssues}`);
  console.log(`    Errors        : ${report.errors}`);
  console.log(`    Warnings      : ${report.warnings}`);
  console.log("  Issues by field:");
  for (const [field, count] of Object.entries(report.issuesByField)) {
    console.log(`    ${field}: ${count}`);
  }
  console.log("═══════════════════════════════════════\n");
}

export function saveReport(report: ValidationReport, filePath?: string): string {
  const dest = filePath || path.join(REPORTS_DIR, `validation-${Date.now().toString(36)}.json`);
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(report, null, 2), "utf-8");
  return dest;
}
