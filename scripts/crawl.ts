/**
 * CLI Entry Point: npm run crawl
 *
 * Full crawl: discovers boards → classes → subjects → textbooks → chapters →
 * questions → solutions. Downloads PDFs and cover images when available.
 *
 * Usage:
 *   npx tsx scripts/crawl.ts
 *   npx tsx scripts/crawl.ts --board=maharashtra --class=10
 *   npx tsx scripts/crawl.ts --board=cbse --class=9,10 --parallel=3
 *   npx tsx scripts/crawl.ts --discover-only
 */
import { discoverBoards, discoverClasses, discoverSubjects, discoverTextbooks } from "./crawler/modules/discoverer";
import { scrapeTextbook } from "./crawler/modules/scraper";
import { downloadBookResources } from "./crawler/modules/downloader";
import {
  getStats,
  incrementStat,
  recordError,
  generateReport,
} from "./crawler/modules/reporter";
import { closeBrowser } from "./crawler/utils/browser";
import { cache } from "./crawler/utils/cache";
import { logger } from "./crawler/utils/logger";
import { BOARD_CONFIG, OUTPUT_DIR } from "./crawler/config/index";
import { exportMetadata } from "./crawler/modules/exporter";
import fs from "fs";
import path from "path";

import { fetchPageHtml } from "./crawler/utils/fetcher";
import { extractSubjectLinks, extractTextbookLinks, extractChapterLinks, extractQuestionLinks } from "./crawler/utils/html-parser";

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  const hasFlag = (name: string) => args.includes(`--${name}`);

  const boardFilter = getArg("board");
  const classFilter = getArg("class");
  const subjectFilter = getArg("subject");
  const parallel = parseInt(getArg("parallel") || "2");
  const discoverOnly = hasFlag("discover-only");

  console.log("═".repeat(60));
  console.log("  CareerGuru4U — Academic Library Crawler");
  console.log("  Starting URL: https://www.shaalaa.com/study-material");
  if (boardFilter) console.log(`  Board: ${boardFilter}`);
  if (classFilter) console.log(`  Class: ${classFilter}`);
  console.log(`  Parallel: ${parallel}  |  Discover Only: ${discoverOnly}`);
  console.log("═".repeat(60));

  // Ensure output directories
  const dirs = ["boards", "downloads", "metadata", "logs", "cache", "reports", "exports"];
  for (const d of dirs) {
    fs.mkdirSync(path.join(process.cwd(), OUTPUT_DIR, d), { recursive: true });
  }

  try {
    // Phase 1: Discover boards
    console.log("\n📋 Phase 1: Discovering boards...");
    let boards = await discoverBoards(BOARD_CONFIG.maharashtra.url);

    if (boards.length === 0) {
      // Fallback to configured boards
      boards = Object.values(BOARD_CONFIG).map((b) => ({
        name: b.name,
        key: b.key,
        url: b.url,
      }));
    }

    if (boardFilter) {
      boards = boards.filter((b) => b.key === boardFilter || b.name.toLowerCase().includes(boardFilter.toLowerCase()));
    }

    incrementStat("boardsFound", boards.length);
    console.log(`  Found ${boards.length} board(s): ${boards.map((b) => b.name).join(", ")}`);

    // Save boards list
    fs.writeFileSync(
      path.join(process.cwd(), OUTPUT_DIR, "boards", "boards.json"),
      JSON.stringify(boards, null, 2)
    );

    // Phase 2: Discover classes & subjects for each board
    console.log("\n📋 Phase 2: Discovering classes & subjects...");
    let totalClasses = 0;
    let totalSubjects = 0;

    interface TaskItem {
      boardKey: string;
      boardName: string;
      classNum: number;
      courseId: number;
      courseSlug: string;
      subjectName: string;
      subjectSlug: string;
      subjectId: string;
    }

    const allTasks: TaskItem[] = [];

    for (const board of boards) {
      const classes = await discoverClasses(board.key);
      const classFilterList = classFilter?.split(",").map(Number);

      for (const cls of classes) {
        if (classFilterList && !classFilterList.includes(cls.classNum)) continue;
        totalClasses++;

        const subjects = await discoverSubjects(board.key, cls.classNum);
        totalSubjects += subjects.length;

        for (const subject of subjects) {
          // Apply subject filter if specified
          if (subjectFilter) {
            const sLower = subject.name.toLowerCase();
            const fLower = subjectFilter.toLowerCase();
            if (!sLower.includes(fLower) && !subject.slug.includes(fLower)) continue;
          }

          allTasks.push({
            boardKey: board.key,
            boardName: board.name,
            classNum: cls.classNum,
            courseId: cls.courseId,
            courseSlug: cls.courseSlug,
            subjectName: subject.name,
            subjectSlug: subject.slug,
            subjectId: subject.id,
          });
        }
      }
    }

    incrementStat("classesFound", totalClasses);
    incrementStat("subjectsFound", totalSubjects);
    console.log(`  ${totalClasses} classes, ${totalSubjects} subjects, ${allTasks.length} subject-tasks`);

    // Save subjects by board
    const boardSubjects: Record<string, Record<number, Array<{ name: string; slug: string; id: string }>>> = {};
    for (const task of allTasks) {
      if (!boardSubjects[task.boardKey]) boardSubjects[task.boardKey] = {};
      if (!boardSubjects[task.boardKey][task.classNum]) boardSubjects[task.boardKey][task.classNum] = [];
      boardSubjects[task.boardKey][task.classNum].push({
        name: task.subjectName,
        slug: task.subjectSlug,
        id: task.subjectId,
      });
    }
    fs.writeFileSync(
      path.join(process.cwd(), OUTPUT_DIR, "boards", "subjects.json"),
      JSON.stringify(boardSubjects, null, 2)
    );

    if (discoverOnly) {
      console.log("\n✅ Discovery complete. Run without --discover-only to scrape solutions.");
      await closeBrowser();
      generateReport(getStats());
      return;
    }

    // Phase 3: Scrape textbooks & solutions
    console.log("\n📋 Phase 3: Scraping solutions...");
    let totalSolutions = 0;

    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i];
      console.log(`\n[${i + 1}/${allTasks.length}] ${task.boardName} Class ${task.classNum} — ${task.subjectName}`);

      try {
        const textbooks = await discoverTextbooks(
          task.boardKey,
          task.classNum,
          task.subjectSlug,
          task.subjectName,
          task.subjectId
        );
        incrementStat("booksFound", textbooks.length);

        for (const textbook of textbooks) {
          // Download book resources (covers, PDFs if available)
          await downloadBookResources(textbook.url, {
            board: task.boardName,
            class: task.classNum,
            publication: textbook.publication,
            subject: task.subjectName,
            bookName: textbook.slug,
            bookSlug: textbook.slug,
            language: "English",
          });

          // Scrape solutions
          const solutions = await scrapeTextbook(textbook.url, textbook.slug, {
            board: task.boardName,
            classNum: task.classNum,
            subject: task.subjectName,
            publication: textbook.publication,
          });

          totalSolutions += solutions.length;
          incrementStat("solutionsFound", solutions.length);

          // Count questions found
          try {
            const html = await fetchPageHtml(textbook.url);
            const chapters = extractChapterLinks(html);
            const questions = extractQuestionLinks(html);
            incrementStat("questionsFound", questions.length);
          } catch {}

          // Save incremental checkpoint
          cache.saveCheckpoint("crawl-progress", {
            lastTaskIndex: i,
            totalSolutions,
            completedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        recordError(`Task failed: ${task.boardName} Class ${task.classNum} ${task.subjectName} — ${(err as Error).message}`);
        logger.error(`Task failed: ${(err as Error).message}`);
      }
    }

    console.log(`\n📊 Total solutions scraped: ${totalSolutions}`);

    // Phase 4: Export
    console.log("\n📋 Phase 4: Exporting metadata...");
    exportMetadata();

    // Final report
    generateReport(getStats());
    console.log("\n" + "═".repeat(60));
    console.log("  Crawl Complete!");
    console.log(`  Reports saved to: ${OUTPUT_DIR}/reports/`);
    console.log(`  Metadata saved to: ${OUTPUT_DIR}/metadata/`);
    console.log(`  Downloads saved to: ${OUTPUT_DIR}/downloads/`);
    console.log("═".repeat(60));
  } catch (err) {
    logger.error(`Fatal: ${(err as Error).message}`);
    recordError(`Fatal: ${(err as Error).message}`);
  } finally {
    await closeBrowser();
    generateReport(getStats());
  }
}

main().catch(console.error);
