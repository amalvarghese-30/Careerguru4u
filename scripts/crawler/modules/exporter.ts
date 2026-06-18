/**
 * Export module — exports all metadata into structured formats (JSON, CSV, TXT).
 */
import path from "path";
import fs from "fs";
import { OUTPUT_DIR } from "../config/index";
import { logger } from "../utils/logger";

interface BookEntry {
  board: string;
  class: number;
  publication: string;
  subject: string;
  bookName: string;
  bookURL: string;
  publicPdfURL?: string | null;
  solutionURL?: string;
}

export function exportMetadata() {
  const downloadsDir = path.join(process.cwd(), OUTPUT_DIR, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    logger.warn("No downloads directory found. Run a crawl first.");
    return;
  }

  const allBooks: BookEntry[] = [];
  const allChapters: Record<string, string[]> = {};
  const allPdfLinks: string[] = [];

  function walk(dir: string, depth: number = 0) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fp, depth + 1);
      } else if (entry.name === "metadata.json") {
        try {
          const meta = JSON.parse(fs.readFileSync(fp, "utf-8"));
          allBooks.push({
            board: meta.board,
            class: meta.class,
            publication: meta.publication,
            subject: meta.subject,
            bookName: meta.bookName,
            bookURL: meta.bookURL,
            publicPdfURL: meta.publicPdfURL,
            solutionURL: meta.solutionURL,
          });
          if (meta.chapters) {
            allChapters[meta.bookName] = meta.chapters;
          }
          if (meta.publicPdfURL) {
            allPdfLinks.push(meta.publicPdfURL);
          }
        } catch {}
      }
    }
  }

  walk(downloadsDir);

  const exportDir = path.join(process.cwd(), OUTPUT_DIR, "exports");
  fs.mkdirSync(exportDir, { recursive: true });

  // books.json
  fs.writeFileSync(
    path.join(exportDir, "books.json"),
    JSON.stringify(allBooks, null, 2)
  );

  // books.csv
  const csvRows = ["Board,Class,Publication,Subject,Book Name,Book URL,PDF URL"];
  for (const b of allBooks) {
    csvRows.push(
      `"${b.board}",${b.class},"${b.publication}","${b.subject}","${b.bookName}","${b.bookURL}","${b.publicPdfURL || ""}"`
    );
  }
  fs.writeFileSync(path.join(exportDir, "books.csv"), csvRows.join("\n"));

  // books.txt (hierarchical format)
  const txtLines: string[] = [];
  const grouped: Record<string, Record<number, Record<string, Record<string, BookEntry[]>>>> = {};
  for (const b of allBooks) {
    if (!grouped[b.board]) grouped[b.board] = {};
    if (!grouped[b.board][b.class]) grouped[b.board][b.class] = {};
    if (!grouped[b.board][b.class][b.publication]) grouped[b.board][b.class][b.publication] = {};
    if (!grouped[b.board][b.class][b.publication][b.subject]) grouped[b.board][b.class][b.publication][b.subject] = [];
    grouped[b.board][b.class][b.publication][b.subject].push(b);
  }

  for (const board of Object.keys(grouped).sort()) {
    txtLines.push(board);
    for (const cls of Object.keys(grouped[board]).sort((a, b) => Number(a) - Number(b))) {
      txtLines.push(`  Class ${cls}`);
      for (const pub of Object.keys(grouped[board][Number(cls)]).sort()) {
        txtLines.push(`    ${pub}`);
        for (const subj of Object.keys(grouped[board][Number(cls)][pub]).sort()) {
          txtLines.push(`      ${subj}`);
          for (const book of grouped[board][Number(cls)][pub][subj]) {
            txtLines.push(`        ${book.bookName}`);
            txtLines.push(`          ${book.bookURL}`);
            if (book.publicPdfURL) txtLines.push(`          ${book.publicPdfURL}`);
          }
        }
      }
    }
  }
  fs.writeFileSync(path.join(exportDir, "books.txt"), txtLines.join("\n"));

  // chapters.json
  fs.writeFileSync(
    path.join(exportDir, "chapters.json"),
    JSON.stringify(allChapters, null, 2)
  );

  // pdf-links.json
  fs.writeFileSync(
    path.join(exportDir, "pdf-links.json"),
    JSON.stringify(allPdfLinks, null, 2)
  );

  logger.success(`Exported ${allBooks.length} books to ${exportDir}`);
  logger.info(`Formats: books.json, books.csv, books.txt, chapters.json, pdf-links.json`);
}

// Allow running directly: npx tsx scripts/crawler/modules/exporter.ts
if (process.argv[1]?.includes("exporter")) {
  exportMetadata();
}
