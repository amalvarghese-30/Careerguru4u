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
  saveDiscoveryCache,
  loadDiscoveryCache,
  type CachedDiscovery,
} from "./crawler/cache";
import { parseHtmlPage } from "./parser";
import { cleanMathNotation } from "./equation";
import { normalizeText, normalizeBlocks } from "./normalizer";
import { extractQuestion, detectQuestionType, detectDifficulty, extractQuestionNumber } from "./question";
import { extractSolution } from "./solution";
import { validateSolution } from "./validator";
import { addToReviewQueue } from "./review";
import { detectImages } from "./media";
import { DELAY_MS } from "./config";
import type { BoardKey, KnownTextbook, Solution } from "./types";
import { KNOWN_TEXTBOOKS, getBoardName } from "./config/boards";

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

        // If 0 subjects were discovered but KNOWN_TEXTBOOKS exists, create a synthetic task
        if (subjects.length === 0) {
          const known = KNOWN_TEXTBOOKS[board.key] as Record<number, unknown[]> | undefined;
          if (known && known[cls.classNum] && known[cls.classNum].length > 0) {
            console.log(`[pipeline] No subjects found for ${board.key} class ${cls.classNum}, but KNOWN_TEXTBOOKS has ${known[cls.classNum].length} entries — adding synthetic task`);
            stats.subjectsFound++;
            tasks.push({
              boardKey: board.key as BoardKey,
              boardName: board.name,
              classNum: cls.classNum,
              courseId: cls.courseId,
              courseSlug: cls.courseSlug,
              medium: cls.medium,
              subjectName: "All",
              subjectSlug: "",
              subjectId: "",
            });
          }
          continue;
        }

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

    // Phase 2.5: Build discovery cache for each class (runs full discovery ONCE per class)
    const discoveryCacheMap = new Map<string, CachedDiscovery>();
    if (opts.resume) {
      // Try to load existing cache
      for (const task of tasks) {
        const cacheKey = `${task.boardKey}_class${task.classNum}`;
        if (!discoveryCacheMap.has(cacheKey)) {
          const cached = loadDiscoveryCache(task.boardKey, task.classNum);
          if (cached) {
            discoveryCacheMap.set(cacheKey, cached);
            console.log(`[cache] Loaded discovery cache for ${task.boardKey} class ${task.classNum} (${cached.textbooks.length} textbooks)`);
          }
        }
      }
    }

    // Rebuild any empty discovery caches (e.g. lower classes where empty subject filter returns 0)
    // Fetch textbooks per-subject, then deduplicate
    if (tasks.length > 0) {
      const seenClasses = new Set<string>();
      for (const task of tasks) {
        const cacheKey = `${task.boardKey}_class${task.classNum}`;
        const existing = discoveryCacheMap.get(cacheKey);
        if (existing && existing.textbooks.length > 0) continue; // has valid cache, skip
        if (seenClasses.has(cacheKey)) continue;
        seenClasses.add(cacheKey);

        opts.onProgress?.("discovery", 0, 0, `Caching discovery for ${task.boardName} Class ${task.classNum}...`);
        console.log(`[cache] Building discovery cache for ${task.boardKey} class ${task.classNum}...`);

        // Collect all subjects for this class
        const classTasks = tasks.filter((t) => t.boardKey === task.boardKey && t.classNum === task.classNum);

        const cached: CachedDiscovery = {
          boardKey: task.boardKey,
          classNum: task.classNum,
          textbooks: [],
          savedAt: new Date().toISOString(),
        };
        const seenTextbookIds = new Set<string>();

        // KNOWN_TEXTBOOKS first: when available, use them directly instead of the unfiltered
        // listing (which often returns textbooks from ALL classes, not just this one).
        const known = KNOWN_TEXTBOOKS[task.boardKey] as Record<number, KnownTextbook[]> | undefined;
        const knownBooks = known?.[task.classNum];
        if (knownBooks && knownBooks.length > 0) {
          console.log(`[cache] Using ${knownBooks.length} KNOWN_TEXTBOOKS entries for ${task.boardKey} class ${task.classNum}`);
          for (const kb of knownBooks) {
            const tbUrl = `https://www.shaalaa.com/textbook-solutions/${kb.slug}_${kb.id}`;
            const tbChapters = opts.usePlaywright
              ? await discoverChaptersWithBrowser(tbUrl)
              : await discoverChapters(tbUrl);
            const tbData: CachedDiscovery["textbooks"][0] = {
              id: kb.id,
              slug: kb.slug,
              url: tbUrl,
              subjectSlug: "",
              chapters: [],
            };
            for (const ch of tbChapters) {
              const chQuestions = opts.usePlaywright
                ? await discoverQuestionsWithBrowser(ch.url)
                : await discoverQuestions(ch.url);
              tbData.chapters.push({
                id: ch.id,
                name: ch.name,
                url: ch.url,
                questions: chQuestions.map((q) => ({ id: q.id, url: q.url, slug: q.slug })),
              });
            }
            cached.textbooks.push(tbData);
            seenTextbookIds.add(kb.id);
          }
        } else {
          // First try WITHOUT any subject filter — the listing page for lower classes
          // shows all textbooks regardless of subject, and subject-filtered URLs return 0.
          const allTextbooks = opts.usePlaywright
            ? await discoverTextbooksWithBrowser(task.boardKey, task.classNum, "", "All", "")
            : await discoverTextbooks(task.boardKey, task.classNum, "", "All", "");

          if (allTextbooks.length > 0) {
            console.log(`[cache] Found ${allTextbooks.length} textbooks via unfiltered listing for class ${task.classNum}`);
            for (const tb of allTextbooks) {
              if (seenTextbookIds.has(tb.id)) continue;
              seenTextbookIds.add(tb.id);

              const tbChapters = opts.usePlaywright
                ? await discoverChaptersWithBrowser(tb.url)
                : await discoverChapters(tb.url);
              const tbData: CachedDiscovery["textbooks"][0] = {
                id: tb.id,
                slug: tb.slug,
                url: tb.url,
                subjectSlug: "",
                chapters: [],
              };
              for (const ch of tbChapters) {
                const chQuestions = opts.usePlaywright
                  ? await discoverQuestionsWithBrowser(ch.url)
                  : await discoverQuestions(ch.url);
                tbData.chapters.push({
                  id: ch.id,
                  name: ch.name,
                  url: ch.url,
                  questions: chQuestions.map((q) => ({ id: q.id, url: q.url, slug: q.slug })),
                });
              }
              cached.textbooks.push(tbData);
            }
          } else {
          // Fallback: discover per-subject (used when subject filters actually work, e.g. upper classes)
          for (const ct of classTasks) {
            const textbooks = opts.usePlaywright
              ? await discoverTextbooksWithBrowser(ct.boardKey, ct.classNum, ct.subjectSlug, ct.subjectName, ct.subjectId)
              : await discoverTextbooks(ct.boardKey, ct.classNum, ct.subjectSlug, ct.subjectName, ct.subjectId);

            for (const tb of textbooks) {
              if (seenTextbookIds.has(tb.id)) continue;
              seenTextbookIds.add(tb.id);

              const tbChapters = opts.usePlaywright
                ? await discoverChaptersWithBrowser(tb.url)
                : await discoverChapters(tb.url);
              const tbData: CachedDiscovery["textbooks"][0] = {
                id: tb.id,
                slug: tb.slug,
                url: tb.url,
                subjectSlug: ct.subjectSlug,
                chapters: [],
              };
              for (const ch of tbChapters) {
                const chQuestions = opts.usePlaywright
                  ? await discoverQuestionsWithBrowser(ch.url)
                  : await discoverQuestions(ch.url);
                tbData.chapters.push({
                  id: ch.id,
                  name: ch.name,
                  url: ch.url,
                  questions: chQuestions.map((q) => ({ id: q.id, url: q.url, slug: q.slug })),
                });
              }
              cached.textbooks.push(tbData);
            }
          }
          }
        }

        // KNOWN_TEXTBOOKS fallback: if discovery found 0 textbooks, use hardcoded entries
        if (cached.textbooks.length === 0) {
          const known = KNOWN_TEXTBOOKS[task.boardKey] as Record<number, KnownTextbook[]> | undefined;
          const knownBooks = known?.[task.classNum];
          if (knownBooks && knownBooks.length > 0) {
            console.log(`[cache] Discovery found 0 textbooks for ${task.boardKey} class ${task.classNum}, falling back to ${knownBooks.length} KNOWN_TEXTBOOKS entries`);
            for (const kb of knownBooks) {
              const tbUrl = `https://www.shaalaa.com/textbook-solutions/${kb.slug}_${kb.id}`;
              const tbChapters = opts.usePlaywright
                ? await discoverChaptersWithBrowser(tbUrl)
                : await discoverChapters(tbUrl);
              const tbData: CachedDiscovery["textbooks"][0] = {
                id: kb.id,
                slug: kb.slug,
                url: tbUrl,
                subjectSlug: "",
                chapters: [],
              };
              for (const ch of tbChapters) {
                const chQuestions = opts.usePlaywright
                  ? await discoverQuestionsWithBrowser(ch.url)
                  : await discoverQuestions(ch.url);
                tbData.chapters.push({
                  id: ch.id,
                  name: ch.name,
                  url: ch.url,
                  questions: chQuestions.map((q) => ({ id: q.id, url: q.url, slug: q.slug })),
                });
              }
              cached.textbooks.push(tbData);
              seenTextbookIds.add(kb.id);
            }
          }
        }

        saveDiscoveryCache(task.boardKey, task.classNum, cached);
        discoveryCacheMap.set(cacheKey, cached);
        const totalChapters = cached.textbooks.reduce((s, t) => s + t.chapters.length, 0);
        console.log(`[cache] Saved discovery cache: ${cached.textbooks.length} textbooks, ${totalChapters} chapters total`);
      }
    }

    // Phase 3: Iterate cached textbooks directly — process ALL chapters from ALL textbooks
    // No subject matching needed — each textbook maps to one subject naturally
    let totalDone = 0;
    let totalChapters = 0;

    for (const task of tasks) {
      // Count total chapters across all cached textbooks for progress
      const cachedDiscovery = discoveryCacheMap.get(`${task.boardKey}_class${task.classNum}`);
      if (cachedDiscovery) {
        for (const tb of cachedDiscovery.textbooks) {
          totalChapters += tb.chapters.length;
        }
      }
    }
    // Deduplicate: only process each unique board+class once (the cache has everything)
    const processedClasses = new Set<string>();

    for (const task of tasks) {
      const classKey = `${task.boardKey}_${task.classNum}`;
      if (processedClasses.has(classKey)) continue;
      processedClasses.add(classKey);

      const cachedDiscovery = discoveryCacheMap.get(`${task.boardKey}_class${task.classNum}`);
      if (!cachedDiscovery) continue;

      // Extract subject from textbook slug — handles multiple publisher patterns:
      // Balbharati: "balbharati-solutions-mathematics-english-standard-5-maharashtra-state-board_259"
      // NCERT:      "ncert-solutions-mathematics-english-class-9"
      //             "ncert-solutions-chemistry-part-1-and-2-english-class-11"
      // RD Sharma:  "rd-sharma-solutions-mathematics-english-class-10"
      const extractSubjectFromTextbookSlug = (slug: string): string => {
        let s = slug;
        // Strip publisher prefix
        s = s.replace(/^(?:balbharati|ncert|rd-sharma|frank|selina|sp-singh|scert-maharashtra|samacheer-kalvi|lakhmir-singh|ts-grewal|ml-aggarwal|rs-aggarwal|ncert-exemplar)-solutions-/, "");
        // Strip "-concise" and "-exemplar" qualifiers
        s = s.replace(/-concise/g, "");
        s = s.replace(/-exemplar/g, "");
        // Strip "-part-N-and-N" or "-part-i-and-ii" or "-part-N" (multi-part books)
        s = s.replace(/-part-\d+-and-\d+$/, "");
        s = s.replace(/-part-i-and-ii$/, "");
        s = s.replace(/-part-\d+$/, "");
        // Strip "-icse" suffix
        s = s.replace(/-icse$/, "");
        // Strip "-maharashtra-state[-board]" suffix
        s = s.replace(/-maharashtra-state(?:-board)?$/, "");
        // Strip "-hsc" (class 12 Maharashtra pattern)
        s = s.replace(/-hsc$/, "");
        // Strip "-tn-board" (Tamil Nadu pattern)
        s = s.replace(/-tn-board$/, "");
        // Strip "-ssc" (secondary pattern)
        s = s.replace(/-ssc$/, "");
        // Strip "-{lang}-standard-N" or "-{lang}-N-standard" (Balbharati pattern)
        s = s.replace(/-(?:english|hindi|marathi|sanskrit|urdu)-(?:standard-\d+|\d+-standard)$/, "");
        // Strip "-{lang}-class-N" (NCERT/CBSE pattern)
        s = s.replace(/-(?:english|hindi|marathi|sanskrit|urdu)-class-\d+$/, "");
        // Strip "-volume-1-and-2" or "-term-1/2/3" (Samacheer Kalvi pattern)
        s = s.replace(/-volume-1-and-2$/, "");
        s = s.replace(/-term-[123]$/, "");
        // Strip NCERT primary book-name suffixes (marigold, raindrops, rimjhim, looking-around)
        s = s.replace(/-marigold$/, "");
        s = s.replace(/-raindrops$/, "");
        s = s.replace(/-rimjhim$/, "");
        s = s.replace(/-looking-around$/, "");
        // Final cleanup: strip trailing "-class-N"
        s = s.replace(/-class-\d+$/, "");
        return s;
      };

      for (const textbook of cachedDiscovery.textbooks) {
        const tbSubject = extractSubjectFromTextbookSlug(textbook.slug);
        opts.onProgress?.("scraping", totalDone, totalChapters, `Class ${task.classNum} — ${tbSubject}`);

        for (const chapter of textbook.chapters) {
          // Resume: skip completed chapters (keyed by textbook slug + chapter id)
          const checkpointKey = `${task.boardKey}_${task.classNum}_${textbook.slug}_${chapter.id}`;
          if (opts.resume) {
            const cp = loadCheckpoint(checkpointKey);
            if (cp && cp.stats.solutionsFound > 0) {
              stats.solutionsScraped += cp.stats.solutionsFound;
              totalDone++;
              continue;
            }
          }

          const questions = chapter.questions.map((q) => ({ id: q.id, url: q.url }));

          // Scrape solutions for this chapter
          let chapterSolutions = 0;
          for (let qi = 0; qi < questions.length; qi++) {
            const q = questions[qi];
            await sleep(DELAY_MS);

            try {
              const { html } = await fetchSolutionPage(q.url);
              markVisited(q.url, 200, "solution_page");

              const parsed = parseHtmlPage(html, q.url);
              const questionBlocks = extractQuestion(html);
              const solutionSteps = extractSolution(html);

              const normalizedQuestion = normalizeBlocks(questionBlocks);
              const normalizedSolution = solutionSteps.map((step) => ({
                ...step,
                blocks: normalizeBlocks(step.blocks),
              }));

              const images = detectImages([
                ...normalizedQuestion,
                ...normalizedSolution.flatMap((s) => s.blocks),
              ]);

              const solution: Solution = {
                board: task.boardKey,
                class: task.classNum,
                subject: tbSubject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
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

              const issues = validateSolution(solution);
              if (issues.length > 0) {
                stats.solutionsWithIssues++;
                addToReviewQueue(q.url, task.boardKey, task.classNum, tbSubject, chapter.name, extractQuestionNumber(q.url), issues);
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
            board: getBoardName(task.boardKey),
            class: task.classNum,
            subject: tbSubject,
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
    }
  } finally {
    stopAutoFlush();
    flushAll();
  }

  return { solutions, stats };
}
