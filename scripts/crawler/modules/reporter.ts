/**
 * Report generator — creates comprehensive crawl reports in JSON, CSV, and TXT formats.
 */
import path from "path";
import fs from "fs";
import { OUTPUT_DIR } from "../config/index";

export interface CrawlStats {
  startTime: string;
  endTime?: string;
  boardsFound: number;
  classesFound: number;
  subjectsFound: number;
  booksFound: number;
  questionsFound: number;
  solutionsFound: number;
  pdfsFound: number;
  pdfsDownloaded: number;
  coversDownloaded: number;
  failedDownloads: number;
  missingPdfs: number;
  duplicatesSkipped: number;
  errors: string[];
}

const stats: CrawlStats = {
  startTime: new Date().toISOString(),
  boardsFound: 0,
  classesFound: 0,
  subjectsFound: 0,
  booksFound: 0,
  questionsFound: 0,
  solutionsFound: 0,
  pdfsFound: 0,
  pdfsDownloaded: 0,
  coversDownloaded: 0,
  failedDownloads: 0,
  missingPdfs: 0,
  duplicatesSkipped: 0,
  errors: [],
};

export function getStats(): CrawlStats {
  return stats;
}

export function incrementStat(key: keyof CrawlStats, count: number = 1) {
  if (typeof stats[key] === "number") {
    (stats as unknown as Record<string, number>)[key] += count;
  }
}

export function recordError(msg: string) {
  stats.errors.push(`[${new Date().toISOString()}] ${msg}`);
}

export function generateReport(stats: CrawlStats): void {
  stats.endTime = new Date().toISOString();
  const executionTime =
    (new Date(stats.endTime).getTime() - new Date(stats.startTime).getTime()) / 1000;

  const report = {
    ...stats,
    executionTimeSeconds: executionTime,
    executionTimeDisplay: formatDuration(executionTime),
  };

  const reportDir = path.join(process.cwd(), OUTPUT_DIR, "reports");
  fs.mkdirSync(reportDir, { recursive: true });

  // JSON report
  fs.writeFileSync(
    path.join(reportDir, "crawl-report.json"),
    JSON.stringify(report, null, 2)
  );

  // CSV report
  const csvHeaders = [
    "Metric,Value",
    `"Start Time",${report.startTime}`,
    `"End Time",${report.endTime}`,
    `"Duration",${report.executionTimeDisplay}`,
    `"Boards Found",${report.boardsFound}`,
    `"Classes Found",${report.classesFound}`,
    `"Subjects Found",${report.subjectsFound}`,
    `"Books Found",${report.booksFound}`,
    `"Questions Found",${report.questionsFound}`,
    `"Solutions Found",${report.solutionsFound}`,
    `"PDFs Found",${report.pdfsFound}`,
    `"PDFs Downloaded",${report.pdfsDownloaded}`,
    `"Covers Downloaded",${report.coversDownloaded}`,
    `"Failed Downloads",${report.failedDownloads}`,
    `"Missing PDFs",${report.missingPdfs}`,
    `"Duplicates Skipped",${report.duplicatesSkipped}`,
    `"Errors",${report.errors.length}`,
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "crawl-report.csv"), csvHeaders);

  // Failed pages report
  if (report.errors.length > 0) {
    fs.writeFileSync(
      path.join(reportDir, "failed-pages.json"),
      JSON.stringify(report.errors, null, 2)
    );
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}
