/**
 * Publication patterns & detection — maps slug substrings to
 * canonical publication names for each board.
 *
 * Consolidates:
 *   scripts/crawler/config/index.ts          PUBLICATION_PATTERNS
 *   scripts/crawler/utils/normalize.ts        detectPublication()
 *   scripts/crawler/modules/discoverer.ts     detectPublicationFromSlug()
 */
import type { BoardKey } from "../types";

// ─── Publication Patterns ───────────────────────────────────────────

export const PUBLICATION_PATTERNS: Record<BoardKey, string[]> = {
  maharashtra: ["balbharati", "target", "navneet"],
  cbse: ["ncert", "rd-sharma", "rs-aggarwal", "hc-verma", "oswal", "evergreen", "lakhmir-singh"],
  icse: ["selina", "concise", "ml-aggarwal", "frank", "evergreen"],
};

// ─── Publication Name Map ───────────────────────────────────────────

const PUBLICATION_MAP: Record<BoardKey, Record<string, string>> = {
  maharashtra: {
    balbharati: "Balbharati",
    target:     "Target Publications",
    navneet:    "Navneet",
  },
  cbse: {
    ncert:          "NCERT",
    "rd-sharma":    "RD Sharma",
    "rs-aggarwal":  "RS Aggarwal",
    "hc-verma":     "HC Verma",
    oswal:          "Oswal",
    evergreen:      "Evergreen",
    "lakhmir-singh":"Lakhmir Singh",
  },
  icse: {
    selina:       "Selina Publishers",
    concise:      "Concise",
    "ml-aggarwal":"ML Aggarwal",
    frank:        "Frank Brothers",
    evergreen:    "Evergreen",
  },
};

/**
 * Detect publication name from a textbook slug.
 * Returns "General" if no pattern matches.
 */
export function detectPublication(slug: string, boardKey: BoardKey): string {
  const boardMap = PUBLICATION_MAP[boardKey] || {};
  for (const [pattern, name] of Object.entries(boardMap)) {
    if (slug.includes(pattern)) return name;
  }
  return "General";
}

// ─── Subject → Known Textbook Matching ──────────────────────────────

/**
 * Given a subject name and board, returns the slug patterns to match
 * against KNOWN_TEXTBOOKS entries. Used when discovery fails to surface
 * board-specific textbooks.
 */
export function getSubjectTextbookPatterns(subjectName: string): string[] {
  const s = subjectName.toLowerCase();

  if (s.includes("math") || s.includes("algebra") || s.includes("geometry")) {
    return ["mathematics", "algebra", "geometry"];
  }
  if (s.includes("physics")) {
    return ["science-and-technology-part-1", "science-and-technology-1", "physics"];
  }
  if (s.includes("chemistry")) {
    return ["science-and-technology-part-1", "science-and-technology-1", "chemistry"];
  }
  if (s.includes("biology")) {
    return ["science-and-technology-2", "biology"];
  }
  if (s.includes("science") || s.includes("tech")) {
    return ["science-and-technology", "-science-"];
  }
  if (s.includes("history") || s.includes("civics") || s.includes("political")) {
    return ["history-and-political", "history-and-civics", "history"];
  }
  if (s.includes("geography")) {
    return ["geography"];
  }
  if (s.includes("english")) {
    return ["english-kumarbharati", "english-coursebook"];
  }
  if (s.includes("hindi")) {
    return ["hindi-lokbharati", "hindi-kumarbharati", "hindi"];
  }
  if (s.includes("marathi")) {
    return ["marathi-aksharbharati", "marathi-kumarbharati", "marathi"];
  }
  if (s.includes("sanskrit")) {
    return ["sanskrit-amod", "sanskrit-anand", "sanskrit"];
  }

  return [];
}

// ─── Board-specific Textbook Slug Filters ───────────────────────────

/**
 * Only the first N characters of the slug need to match a board prefix
 * (used by scrape-shaalaa.mjs for stricter filtering).
 */
export const BOARD_SLUG_PREFIXES: Record<BoardKey, string[]> = {
  maharashtra: ["balbharati-solutions"],
  cbse: ["ncert-solutions"],
  icse: ["selina-solutions", "ml-aggarwal", "frank-solutions", "rd-sharma"],
};

/**
 * Class number patterns that appear in textbook slugs.
 * e.g., "standard-10", "10th-standard", "class-10"
 */
export function getClassSlugPatterns(classNum: number): string[] {
  const c = String(classNum);
  return [
    `-standard-${c}`,
    `-${c}th-standard`,
    `-${c}-`,
    `-class-${c}-`,
    `-class-${c}`,
    `-${c}th-`,
  ];
}
