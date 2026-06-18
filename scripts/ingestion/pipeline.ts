/**
 * Pipeline orchestrator — wires discovery → crawl → parse → extract → validate → export
 * into a single runnable flow with checkpoint-based resume support.
 */
import {
  discoverBoards,
  discoverClasses,
  discoverSubjects,
  discoverTextbooks,
  discoverChapters,
  discoverQuestions,
} from "./discovery";
import {
  discoverSubjectsWithBrowser,
  discoverTextbooksWithBrowser,
  discoverChaptersWithBrowser,
  discoverQuestionsWithBrowser,
} from "./discovery/playwright-discovery";
import { fetchSolutionPage } from "./crawler/fetcher";
import {
  markVisited,
  isVisited,
  startAutoFlush,
  stopAutoFlush,
  saveCheckpoint,
  loadCheckpoint,
  flushAll,
} from "./crawler/cache";
import { parseHtmlPage } from "./parser";
import { cleanMathNotation } from "./equation";
import { normalizeText, normalizeBlocks } from "./normalizer";
import { extractQuestion, detectQuestionType, detectDifficulty, extractQuestionNumber } from "./question";
import { extractSolution } from "./solution";
import { validateSolution } from "./validator";
import { addToReviewQueue } from "./review";
import { detectImages } from "./media";
import { MAX_PARALLEL_SCRAPE, DELAY_MS } from "./config";
import type { BoardKey, Solution } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface PipelineOptions {
  board?: BoardKey;
  class?: number;
  subject?: string;
  parallel?: number;
  discoverOnly?: boolean;
  resume?: boolean;
  usePlaywright?: boolean;
  onProgress?: (phase: string, done: number, total: number, label: string) => void;
}

export interface PipelineStats {
  boardsFound: number;
  classesFound: number;
  subjectsFound: number;
  booksFound: number;
  chaptersFound: number;
  questionsFound: number;
  solutionsScraped: number;
  solutionsValid: number;
  solutionsWithIssues: number;
  errors: string[];
}

export async function runPipeline(opts: PipelineOptions = {}): Promise<{ solutions: Solution[]; stats: PipelineStats }> {
  const stats: PipelineStats = {
    boardsFound: 0,
    classesFound: 0,
    subjectsFound: 0,
    booksFound: 0,
    chaptersFound: 0,
    questionsFound: 0,
    solutionsScraped: 0,
    solutionsValid: 0,
    solutionsWithIssues: 0,
    errors: [],
  };

  const solutions: Solution[] = [];
  startAutoFlush(10_000);

  try {
    // Phase 1: Discover boards
    opts.onProgress?.("discovery", 0, 0, "Discovering boards...");
    const boards = await discoverBoards();
    const filteredBoards = opts.board
      ? boards.filter((b) => b.key === opts.board)
      : boards;
    stats.boardsFound = filteredBoards.length;

    if (filteredBoards.length === 0) {
      stats.errors.push("No boards found");
      return { solutions, stats };
    }

    // Phase 2: Discover classes → subjects
    const tasks: {
      boardKey: BoardKey;
      boardName: string;
      classNum: number;
      courseId: number;
      courseSlug: string;
      medium: string;
      subjectName: string;
      subjectSlug: string;
      subjectId: string;
    }[] = [];

    for (const board of filteredBoards) {
      const classes = await discoverClasses(board.key as BoardKey);
      for (const cls of classes) {
        if (opts.class && cls.classNum !== opts.class) continue;
        stats.classesFound++;

        const subjects = opts.usePlaywright
              ? await discoverSubjectsWithBrowser(board.key as BoardKey, cls.classNum)
              : await discoverSubjects(board.key as BoardKey, cls.classNum);
        for (const subject of subjects) {
          if (opts.subject) {
            const s = subject.name.toLowerCase();
            const f = opts.subject.toLowerCase();
            if (!s.includes(f) && !subject.slug.includes(f)) continue;
          }
          stats.subjectsFound++;
          tasks.push({
            boardKey: board.key as BoardKey,
            boardName: board.name,
            classNum: cls.classNum,
            courseId: cls.courseId,
            courseSlug: cls.courseSlug,
            medium: cls.medium,
            subjectName: subject.name,
            subjectSlug: subject.slug,
            subjectId: subject.id,
          });
        }
      }
    }

    if (opts.discoverOnly) {
      return { solutions, stats };
    }

    // Phase 3: Per-subject scraping
    const concurrency = opts.parallel || MAX_PARALLEL_SCRAPE;
    let taskIndex = 0;
    let totalDone = 0;
    const totalTasks = tasks.length;

    for (const task of tasks) {
      taskIndex++;
      opts.onProgress?.("scraping", totalDone, tasks.length, `${task.boardName} Class ${task.classNum} — ${task.subjectName}`);

      try {
        const textbooks = opts.usePlaywright
              ? await discoverTextbooksWithBrowser(
                  task.boardKey,
                  task.classNum,
                  task.subjectSlug,
                  task.subjectName,
                  task.subjectId
                )
              : await discoverTextbooks(
                  task.boardKey,
                  task.classNum,
                  task.subjectSlug,
                  task.subjectName,
                  task.subjectId
                );
        stats.booksFound += textbooks.length;

        for (const textbook of textbooks) {
          // Discover chapters
          const chapters = opts.usePlaywright
                ? await discoverChaptersWithBrowser(textbook.url)
                : await discoverChapters(textbook.url);
          stats.chaptersFound += chapters.length;

          for (const chapter of chapters) {
            // Check for resume: skip completed chapters
            const checkpointKey = `${task.boardKey}_${task.classNum}_${task.subjectSlug}_${chapter.id}`;
            if (opts.resume) {
              const cp = loadCheckpoint(checkpointKey);
              if (cp && cp.stats.solutionsFound > 0) {
                stats.solutionsScraped += cp.stats.solutionsFound;
                totalDone++;
                continue;
              }
            }

            // Discover questions
            const questions = opts.usePlaywright
                  ? await discoverQuestionsWithBrowser(chapter.url)
                  : await discoverQuestions(chapter.url);
            stats.questionsFound += questions.length;

            // Scrape solutions (bounded concurrency)
            let chapterSolutions = 0;
            for (let qi = 0; qi < questions.length; qi++) {
              const q = questions[qi];
              await sleep(DELAY_MS);

              try {
                const { html } = await fetchSolutionPage(q.url);
                markVisited(q.url, 200, "solution_page");

                // Parse
                const parsed = parseHtmlPage(html, q.url);
                const questionBlocks = extractQuestion(html);
                const solutionSteps = extractSolution(html);

                // Normalize
                const normalizedQuestion = normalizeBlocks(questionBlocks);
                const normalizedSolution = solutionSteps.map((step) => ({
                  ...step,
                  blocks: normalizeBlocks(step.blocks),
                }));

                // Detect assets
                const allBlocks = [
                  ...normalizedQuestion,
                  ...normalizedSolution.flatMap((s) => s.blocks),
                ];
                const images = detectImages(allBlocks);

                // Build solution document
                const solution: Solution = {
                  board: task.boardKey,
                  class: task.classNum,
                  subject: task.subjectName,
                  chapter: chapter.name,
                  questionNumber: extractQuestionNumber(q.url),
                  sourceUrl: q.url,
                  sourceType: "scraped",
                  question: normalizedQuestion,
                  solution: normalizedSolution,
                  questionType: detectQuestionType(normalizedQuestion) as Solution["questionType"],
                  difficulty: detectDifficulty(normalizedQuestion) as Solution["difficulty"],
                  images,
                  tables: parsed.tables,
                  equations: parsed.equations,
                  version: 1,
                  isFree: true,
                  viewCount: 0,
                  helpfulCount: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };

                // Validate
                const issues = validateSolution(solution);
                if (issues.length > 0) {
                  stats.solutionsWithIssues++;
                  addToReviewQueue(
                    q.url,
                    task.boardKey,
                    task.classNum,
                    task.subjectName,
                    chapter.name,
                    extractQuestionNumber(q.url),
                    issues
                  );
                } else {
                  stats.solutionsValid++;
                }

                solutions.push(solution);
                chapterSolutions++;
                stats.solutionsScraped++;
                totalDone++;
              } catch (err) {
                stats.errors.push(`Solution failed: ${q.url} — ${(err as Error).message}`);
              }
            }

            // Save chapter checkpoint
            saveCheckpoint(checkpointKey, {
              phase: "scraping",
              board: task.boardKey,
              class: task.classNum,
              subject: task.subjectName,
              chapter: chapter.name,
              stats: {
                subjectsFound: stats.subjectsFound,
                booksFound: stats.booksFound,
                chaptersFound: stats.chaptersFound,
                questionsFound: stats.questionsFound,
                solutionsFound: chapterSolutions,
                errors: stats.errors.slice(-5),
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        stats.errors.push(`Task failed: ${task.boardName} Class ${task.classNum} ${task.subjectName} — ${(err as Error).message}`);
      }
    }
  } finally {
    stopAutoFlush();
    flushAll();
  }

  return { solutions, stats };
}
