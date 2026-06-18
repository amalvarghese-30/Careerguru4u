/**
 * Downloader — handles PDF and cover image downloads for discovered books.
 * Shaalaa primarily hosts web-based solutions rather than downloadable PDFs,
 * but if public PDFs are found, they are downloaded and saved properly.
 */
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";
import { cache } from "../utils/cache";
import { downloadFile, fetchPageHtml } from "../utils/fetcher";
import { extractPdfLinks, extractCoverImage } from "../utils/html-parser";
import { slugify } from "../utils/normalize";
import { OUTPUT_DIR } from "../config/index";

export interface DownloadResult {
  bookPath: string;
  pdfPath: string | null;
  solutionPath: string | null;
  coverPath: string | null;
  metadataPath: string;
}

export async function downloadBookResources(
  textbookUrl: string,
  bookInfo: {
    board: string;
    class: number;
    publication: string;
    subject: string;
    bookName: string;
    bookSlug: string;
    language: string;
  }
): Promise<DownloadResult> {
  const boardSlug = slugify(bookInfo.board);
  const classDir = `class-${bookInfo.class}`;
  const pubSlug = slugify(bookInfo.publication);
  const subjectSlug = slugify(bookInfo.subject);
  const bookSlug = slugify(bookInfo.bookName);

  const baseDir = path.join(
    process.cwd(),
    OUTPUT_DIR,
    "downloads",
    boardSlug,
    classDir,
    pubSlug,
    subjectSlug,
    bookSlug
  );
  fs.mkdirSync(baseDir, { recursive: true });

  const cacheKey = `${boardSlug}/${classDir}/${pubSlug}/${subjectSlug}/${bookSlug}`;
  let pdfPath: string | null = null;
  let solutionPath: string | null = null;
  let coverPath: string | null = null;

  // Fetch page to extract resources
  let html: string;
  try {
    html = await fetchPageHtml(textbookUrl);
  } catch {
    logger.warn(`Could not fetch textbook page: ${textbookUrl}`);
    html = "";
  }

  // Extract and download cover image
  if (html) {
    const coverUrl = extractCoverImage(html);
    if (coverUrl) {
      const coverExt = coverUrl.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] || "jpg";
      const coverFile = path.join(baseDir, "cover." + coverExt);
      const { success, size } = await downloadFile(coverUrl, coverFile);
      if (success) {
        coverPath = coverFile;
        logger.download(`Cover: ${coverUrl} (${formatSize(size)})`);
      }
    }

    // Extract PDF links
    const pdfLinks = extractPdfLinks(html);
    for (const pdfUrl of pdfLinks) {
      if (cache.isPdfDownloaded(pdfUrl)) {
        logger.skip(`PDF already downloaded: ${pdfUrl}`);
        continue;
      }
      const ext = ".pdf";
      const pdfFile = path.join(baseDir, "book" + ext);
      const { success, size } = await downloadFile(pdfUrl, pdfFile);
      if (success && size > 1024) {
        pdfPath = pdfFile;
        cache.markPdfDownloaded(pdfUrl, pdfFile, size);
        logger.download(`PDF: ${pdfUrl} → ${pdfFile} (${formatSize(size)})`);
      }
    }
  }

  // Save metadata
  const metadataPath = path.join(baseDir, "metadata.json");
  const metadata = {
    board: bookInfo.board,
    class: bookInfo.class,
    publication: bookInfo.publication,
    subject: bookInfo.subject,
    bookName: bookInfo.bookName,
    language: bookInfo.language,
    bookURL: textbookUrl,
    solutionURL: textbookUrl,
    publicPdfURL: pdfPath ? "downloaded" : null,
    coverImage: coverPath || null,
    chapters: [],
    downloadedFiles: {
      pdf: pdfPath,
      solution: solutionPath,
      cover: coverPath,
    },
    lastUpdated: new Date().toISOString(),
    crawlDate: new Date().toISOString(),
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  cache.markBookDownloaded(cacheKey, baseDir, 0);

  return { bookPath: baseDir, pdfPath, solutionPath, coverPath, metadataPath };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
