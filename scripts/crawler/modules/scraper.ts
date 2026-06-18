/**
 * Solution scraper — extracts question/answer pairs from Shaalaa question pages.
 */
import path from "path";
import fs from "fs";
import { fetchSolutionPage } from "../utils/fetcher";
import { cache } from "../utils/cache";
import { logger } from "../utils/logger";
import { parseSolutionPage } from "../utils/html-parser";
import { OUTPUT_DIR, DELAY_MS } from "../config/index";

export interface SolutionRecord {
  question: string;
  answer: string;
  board: string;
  class: number;
  subject: string;
  chapter: string;
  questionNumber: number;
  publication: string;
  isFree: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function scrapeQuestion(
  questionUrl: string,
  questionNumber: number,
  metadata: {
    board: string;
    classNum: number;
    subject: string;
    chapter: string;
    publication: string;
  }
): Promise<SolutionRecord | null> {
  try {
    const html = await fetchSolutionPage(questionUrl);
    cache.markVisited(questionUrl, 200, "solution");
    const { question, answer } = parseSolutionPage(html);

    return {
      question: question || `Question ${questionNumber}`,
      answer: answer || "See solution on Shaalaa.com",
      board: metadata.board,
      class: metadata.classNum,
      subject: metadata.subject,
      chapter: metadata.chapter,
      questionNumber,
      publication: metadata.publication,
      isFree: true,
    };
  } catch (err) {
    logger.error(`Q${questionNumber} failed: ${(err as Error).message}`);
    return null;
  }
}

export async function scrapeChapter(
  chapterUrl: string,
  chapterName: string,
  metadata: {
    board: string;
    classNum: number;
    subject: string;
    publication: string;
  }
): Promise<SolutionRecord[]> {
  const { discoverQuestions } = await import("./discoverer");
  logger.info(`Scraping chapter: ${chapterName}`);

  const questions = await discoverQuestions(chapterUrl);
  logger.info(`  ${questions.length} questions found`);

  const solutions: SolutionRecord[] = [];
  for (let i = 0; i < questions.length; i++) {
    const sol = await scrapeQuestion(questions[i].url, i + 1, {
      ...metadata,
      chapter: chapterName,
    });
    if (sol) solutions.push(sol);
    if ((i + 1) % 10 === 0) logger.progress(i + 1, questions.length, "Questions");
  }
  logger.progress(questions.length, questions.length, "Questions");

  return solutions;
}

export async function scrapeTextbook(
  textbookUrl: string,
  textbookSlug: string,
  metadata: {
    board: string;
    classNum: number;
    subject: string;
    publication: string;
  }
): Promise<SolutionRecord[]> {
  const { discoverChapters } = await import("./discoverer");
  logger.info(`Scraping textbook: ${textbookSlug}`);

  const chapters = await discoverChapters(textbookUrl);
  logger.info(`  ${chapters.length} chapters`);

  const allSolutions: SolutionRecord[] = [];
  for (const ch of chapters) {
    const chapterSolutions = await scrapeChapter(ch.url, ch.name, metadata);
    allSolutions.push(...chapterSolutions);

    // Incremental save after each chapter
    saveSolutions(allSolutions, metadata.board, metadata.classNum, metadata.subject, metadata.publication);
  }

  return allSolutions;
}

function saveSolutions(
  solutions: SolutionRecord[],
  board: string,
  classNum: number,
  subject: string,
  publication: string
) {
  const dir = path.join(
    process.cwd(),
    OUTPUT_DIR,
    "metadata",
    slugify(board),
    `class-${classNum}`,
    slugify(subject),
    slugify(publication)
  );
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "solutions.json");
  fs.writeFileSync(filePath, JSON.stringify(solutions, null, 2));
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
