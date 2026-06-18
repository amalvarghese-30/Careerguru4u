/**
 * Board & course database — single source of truth.
 *
 * Consolidates COURSE_IDS from:
 *   scripts/crawler/config/index.ts (TypeScript crawler — classes 1-12)
 *   scripts/scrape-shaalaa.mjs          (standalone scraper — classes 1-10)
 *
 * All course slugs have been verified against live Shaalaa URLs.
 */
import type { BoardConfig, BoardKey, CourseEntry, KnownTextbook } from "../types";

// ─── Board Registry ─────────────────────────────────────────────────

export const BOARDS: Record<BoardKey, BoardConfig> = {
  maharashtra: {
    key: "maharashtra",
    name: "Maharashtra Board",
    url: "https://www.shaalaa.com/study-material/maharashtra-board_3186",
  },
  cbse: {
    key: "cbse",
    name: "CBSE",
    url: "https://www.shaalaa.com/study-material/cbse_3025",
  },
  icse: {
    key: "icse",
    name: "ICSE",
    url: "https://www.shaalaa.com/study-material/cisce_3604",
  },
};

export function getBoardName(key: BoardKey): string {
  return BOARDS[key]?.name ?? key;
}

// ─── Course ID Database ─────────────────────────────────────────────

export const COURSE_IDS: Record<BoardKey, Record<number, CourseEntry>> = {
  maharashtra: {
    1:  { id: 1442, slug: "maharashtra-state-board-1st-standard",                    medium: "english" },
    2:  { id: 1443, slug: "maharashtra-state-board-2nd-standard",                    medium: "english" },
    3:  { id: 1444, slug: "maharashtra-state-board-3rd-standard",                    medium: "english" },
    4:  { id: 1445, slug: "maharashtra-state-board-4th-standard",                    medium: "english" },
    5:  { id: 1435, slug: "maharashtra-board-5th-standard-ssc-english-medium",       medium: "english" },
    6:  { id: 1436, slug: "maharashtra-board-6th-standard-ssc-english-medium",       medium: "english" },
    7:  { id: 1437, slug: "maharashtra-board-7th-standard-ssc-english-medium",       medium: "english" },
    8:  { id: 1438, slug: "maharashtra-board-8th-standard-ssc-english-medium",       medium: "english" },
    9:  { id: 1439, slug: "maharashtra-board-9th-standard-ssc-english-medium",       medium: "english" },
    10: { id: 1440, slug: "maharashtra-board-10th-standard-ssc-english-medium",      medium: "english" },
    11: { id: 1441, slug: "maharashtra-board-11th-standard",                          medium: "english" },
    12: { id: 1446, slug: "maharashtra-board-12th-standard-hsc",                      medium: "english" },
  },
  cbse: {
    1:  { id: 3001, slug: "cbse-class-1-english-medium",                             medium: "english" },
    2:  { id: 3002, slug: "cbse-class-2-english-medium",                             medium: "english" },
    3:  { id: 3003, slug: "cbse-class-3-english-medium",                             medium: "english" },
    4:  { id: 3004, slug: "cbse-class-4-english-medium",                             medium: "english" },
    5:  { id: 3005, slug: "cbse-class-5-english-medium",                             medium: "english" },
    6:  { id: 3006, slug: "cbse-class-6-english-medium",                             medium: "english" },
    7:  { id: 3007, slug: "cbse-class-7-english-medium",                             medium: "english" },
    8:  { id: 3008, slug: "cbse-class-8-english-medium",                             medium: "english" },
    9:  { id: 151,  slug: "cbse-secondary-school-examination-english-medium-class-9", medium: "english" },
    10: { id: 152,  slug: "cbse-secondary-school-examination-english-medium-class-10",medium: "english" },
    11: { id: 153,  slug: "cbse-class-11",                                            medium: "english" },
    12: { id: 154,  slug: "cbse-class-12",                                            medium: "english" },
  },
  icse: {
    1:  { id: 3600, slug: "cisce-icse-class-1",                                                    medium: "english" },
    2:  { id: 3601, slug: "cisce-icse-class-2",                                                    medium: "english" },
    3:  { id: 3602, slug: "cisce-icse-class-3",                                                    medium: "english" },
    4:  { id: 3603, slug: "cisce-icse-class-4",                                                    medium: "english" },
    5:  { id: 3604, slug: "cisce-icse-class-5",                                                    medium: "english" },
    6:  { id: 39,   slug: "cisce-icse-class-6-indian-certificate-of-secondary-education",          medium: "english" },
    7:  { id: 40,   slug: "cisce-icse-class-7-indian-certificate-of-secondary-education",          medium: "english" },
    8:  { id: 41,   slug: "cisce-icse-class-8-indian-certificate-of-secondary-education",          medium: "english" },
    9:  { id: 42,   slug: "cisce-icse-class-9-indian-certificate-of-secondary-education",          medium: "english" },
    10: { id: 661,  slug: "cisce-icse-class-10-indian-certificate-of-secondary-education",         medium: "english" },
    11: { id: 3621, slug: "cisce-isc-class-11",                                                    medium: "english" },
    12: { id: 3622, slug: "cisce-isc-class-12",                                                    medium: "english" },
  },
};

export function getCourse(boardKey: BoardKey, classNum: number): CourseEntry | undefined {
  return COURSE_IDS[boardKey]?.[classNum];
}

export function getBoardClasses(boardKey: BoardKey): number[] {
  return Object.keys(COURSE_IDS[boardKey] || {}).map(Number).sort((a, b) => a - b);
}

// ─── Subject Search URL Builder ─────────────────────────────────────

export function getSubjectSearchUrl(boardKey: BoardKey, classNum: number): string {
  const course = getCourse(boardKey, classNum);
  if (!course) throw new Error(`No course for ${boardKey} class ${classNum}`);
  return `https://www.shaalaa.com/search-textbook-solutions/${course.slug}_${course.id}`;
}

export function getSubjectFilterUrl(boardKey: BoardKey, classNum: number, subjectSlug: string, subjectId: string): string {
  const base = getSubjectSearchUrl(boardKey, classNum);
  return `${base}?subjects=${subjectSlug}_${subjectId}`;
}

// ─── Known Textbook IDs (fallback when discovery fails) ─────────────

export const KNOWN_TEXTBOOKS: Record<string, Record<number, KnownTextbook[]>> = {
  maharashtra: {
    8: [
      { slug: "balbharati-solutions-mathematics-english-standard-8-maharashtra-state-board",           id: "117", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-english-8-standard-maharashtra-state-board",              id: "116", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-civics-english-8-standard-maharashtra-state-board",   id: "118", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-8-standard-maharashtra-state-board",            id: "119", publication: "Balbharati" },
      { slug: "balbharati-solutions-english-english-8-standard-maharashtra-state-board",              id: "120", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-english-8-standard-maharashtra-state-board",                id: "121", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-english-8-standard-maharashtra-state-board",              id: "122", publication: "Balbharati" },
    ],
    9: [
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-9-maharashtra-state-board",    id: "54", publication: "Balbharati" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-9-maharashtra-state-board",   id: "55", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-and-technology-english-9-standard-maharashtra-state-board",   id: "56", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-political-science-english-9-standard-maharashtra-state-board", id: "57", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-9-standard-maharashtra-state-board",                id: "58", publication: "Balbharati" },
      // Languages
      { slug: "balbharati-solutions-english-kumarbharati-english-standard-9-maharashtra-state-board",     id: "200", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-lokbharati-english-standard-9-maharashtra-state-board",         id: "276", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-aksharbharati-english-standard-9-maharashtra-state-board",    id: "278", publication: "Balbharati" },
      { slug: "balbharati-solutions-sanskrit-amod-english-standard-9-maharashtra-state-board",            id: "596", publication: "Balbharati" },
    ],
    10: [
      // Mathematics
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-10-maharashtra-state-board",           id: "52", publication: "Balbharati" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-10-maharashtra-state-board",          id: "50", publication: "Balbharati" },
      // Science
      { slug: "balbharati-solutions-science-and-technology-part-1-english-standard-10-maharashtra-state-board",   id: "51", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-and-technology-2-english-standard-10-maharashtra-state-board",        id: "53", publication: "Balbharati" },
      // Languages & Humanities
      { slug: "balbharati-solutions-english-kumarbharati-english-standard-10-maharashtra-state-board",            id: "199", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-standard-10-maharashtra-state-board",                       id: "104", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-political-science-english-standard-10-maharashtra-state-board",   id: "105", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-lokbharati-english-standard-10-maharashtra-state-board",                id: "275", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-aksharbharati-english-standard-10-maharashtra-state-board",           id: "277", publication: "Balbharati" },
      { slug: "balbharati-solutions-sanskrit-amod-english-standard-10-maharashtra-state-board",                   id: "594", publication: "Balbharati" },
    ],
  },
};
