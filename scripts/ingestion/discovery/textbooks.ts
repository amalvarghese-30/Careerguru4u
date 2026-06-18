/**
 * Textbook discovery — fetches the subject filter page, extracts textbook
 * links, filters by board-specific publication patterns and class number,
 * and falls back to KNOWN_TEXTBOOKS when discovery returns nothing.
 */
import { fetchPage } from "../crawler/fetcher";
import { markVisited } from "../crawler/cache";
import { getSubjectFilterUrl, KNOWN_TEXTBOOKS } from "../config/boards";
import { detectPublication, PUBLICATION_PATTERNS, getSubjectTextbookPatterns, getClassSlugPatterns } from "../config/publications";
import { extractTextbookLinks } from "./link-extractor";
import { BASE_URL } from "../config";
import type { BoardKey, DiscoveredTextbook } from "../types";

export async function discoverTextbooks(
  boardKey: BoardKey,
  classNum: number,
  subjectSlug: string,
  subjectName: string,
  subjectId: string
): Promise<DiscoveredTextbook[]> {
  const url = getSubjectFilterUrl(boardKey, classNum, subjectSlug, subjectId);

  let textbooks: Array<{ url: string; id: string; slug: string }> = [];

  try {
    const { html } = await fetchPage(url);
    markVisited(url, 200, "textbook_list");

    textbooks = extractTextbookLinks(html);

    // Filter by board publication patterns AND class number
    const patterns = PUBLICATION_PATTERNS[boardKey] || [];
    const classPatterns = getClassSlugPatterns(classNum);

    textbooks = textbooks.filter((tb) => {
      const matchesBoard = patterns.some((p) => tb.slug.includes(p));
      if (!matchesBoard) return false;
      return classPatterns.some((p) => tb.slug.includes(p));
    });

    // Fallback to known textbook IDs if discovery returned nothing
    if (textbooks.length === 0) {
      const known = KNOWN_TEXTBOOKS[boardKey]?.[classNum];
      if (known) {
        const subjPatterns = getSubjectTextbookPatterns(subjectName);
        const filtered = subjPatterns.length > 0
          ? known.filter((t) => subjPatterns.some((p) => t.slug.includes(p)))
          : known;

        textbooks = filtered.map((t) => ({
          url: `${BASE_URL}/textbook-solutions/${t.slug}_${t.id}`,
          id: t.id,
          slug: t.slug,
        }));
      }
    }
  } catch {
    // Network error — try known IDs as last resort
    const known = KNOWN_TEXTBOOKS[boardKey]?.[classNum];
    if (known) {
      const subjPatterns = getSubjectTextbookPatterns(subjectName);
      const filtered = subjPatterns.length > 0
        ? known.filter((t) => subjPatterns.some((p) => t.slug.includes(p)))
        : known;

      textbooks = filtered.map((t) => ({
        url: `${BASE_URL}/textbook-solutions/${t.slug}_${t.id}`,
        id: t.id,
        slug: t.slug,
      }));
    }
  }

  return textbooks.map((tb) => ({
    ...tb,
    publication: detectPublication(tb.slug, boardKey),
  }));
}
