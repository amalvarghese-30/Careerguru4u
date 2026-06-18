/**
 * Playwright-based discovery functions for JS-heavy listing pages.
 *
 * These mirror the static discovery functions but use browser rendering
 * for the initial page load. After getting the HTML, the same regex-based
 * link extraction from link-extractor.ts is used.
 */
import { fetchDynamicHtml } from "../crawler/playwright-fetcher";
import {
  extractSubjectLinks,
  extractTextbookLinks,
  extractChapterLinks,
  extractQuestionLinks,
} from "./link-extractor";
import { COURSE_IDS, KNOWN_TEXTBOOKS } from "../config/boards";
import {
  detectPublication,
  PUBLICATION_PATTERNS,
  getSubjectTextbookPatterns,
  getClassSlugPatterns,
} from "../config/publications";
import { BASE_URL } from "../config";
import type {
  BoardKey,
  DiscoveredSubject,
  DiscoveredTextbook,
  DiscoveredChapter,
  DiscoveredQuestion,
} from "../types";

/**
 * Discover subjects for a board+class using browser rendering.
 */
export async function discoverSubjectsWithBrowser(
  boardKey: BoardKey,
  classNum: number
): Promise<DiscoveredSubject[]> {
  const courses = COURSE_IDS[boardKey];
  if (!courses || !courses[classNum]) {
    console.warn(`[PW-Discovery] No course data for ${boardKey} class ${classNum}`);
    return [];
  }

  const course = courses[classNum];
  const url = `${BASE_URL}/search-textbook-solutions/${course.slug}_${course.id}`;

  console.log(`[PW-Discovery] Fetching subjects: ${url}`);
  const html = await fetchDynamicHtml(url);

  const subjects = extractSubjectLinks(html);
  console.log(`[PW-Discovery] Found ${subjects.length} subjects for ${boardKey} class ${classNum}`);
  return subjects;
}

/**
 * Discover textbooks for a subject using browser rendering.
 */
export async function discoverTextbooksWithBrowser(
  boardKey: BoardKey,
  classNum: number,
  subjectSlug: string,
  subjectName: string,
  subjectId: string
): Promise<DiscoveredTextbook[]> {
  const courses = COURSE_IDS[boardKey];
  if (!courses || !courses[classNum]) return [];

  const course = courses[classNum];
  const url = `${BASE_URL}/search-textbook-solutions/${course.slug}_${course.id}?subjects=${subjectSlug}`;

  console.log(`[PW-Discovery] Fetching textbooks: ${url}`);
  const html = await fetchDynamicHtml(url);

  let textbooks = extractTextbookLinks(html);

  // Filter by board publication patterns and class number
  const patterns = PUBLICATION_PATTERNS[boardKey] || [];
  const classPatterns = getClassSlugPatterns(classNum);

  textbooks = textbooks.filter((tb) => {
    const matchesBoard = patterns.some((p) => tb.slug.includes(p));
    if (!matchesBoard) return false;
    return classPatterns.some((p) => tb.slug.includes(p));
  });

  // Fallback to known textbook IDs if discovery returned nothing
  if (textbooks.length === 0) {
    const known = KNOWN_TEXTBOOKS[boardKey] as Record<number, { slug: string; id: string; publication: string }[]> | undefined;
    if (known && known[classNum]) {
      const subjPatterns = getSubjectTextbookPatterns(subjectName);
      const filtered = subjPatterns.length > 0
        ? known[classNum].filter((t) => subjPatterns.some((p) => t.slug.includes(p)))
        : known[classNum];

      textbooks = filtered.map((t) => ({
        url: `${BASE_URL}/textbook-solutions/${t.slug}_${t.id}`,
        id: t.id,
        slug: t.slug,
      }));
    }
  }

  console.log(`[PW-Discovery] Found ${textbooks.length} textbooks for ${subjectName}`);
  return textbooks.map((tb) => ({
    ...tb,
    publication: detectPublication(tb.slug, boardKey),
  }));
}

/**
 * Discover chapters for a textbook using browser rendering.
 */
export async function discoverChaptersWithBrowser(textbookUrl: string): Promise<DiscoveredChapter[]> {
  console.log(`[PW-Discovery] Fetching chapters: ${textbookUrl}`);
  const html = await fetchDynamicHtml(textbookUrl);

  const chapters = extractChapterLinks(html);
  console.log(`[PW-Discovery] Found ${chapters.length} chapters`);
  return chapters;
}

/**
 * Discover questions for a chapter using browser rendering.
 */
export async function discoverQuestionsWithBrowser(chapterUrl: string): Promise<DiscoveredQuestion[]> {
  console.log(`[PW-Discovery] Fetching questions: ${chapterUrl}`);
  const html = await fetchDynamicHtml(chapterUrl);

  const questions = extractQuestionLinks(html);
  console.log(`[PW-Discovery] Found ${questions.length} questions`);
  return questions;
}
