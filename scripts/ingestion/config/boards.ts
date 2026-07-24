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
    1:  { id: 1511, slug: "cbse-class-1-cbse-primary-english-medium",                 medium: "english" },
    2:  { id: 1512, slug: "cbse-class-2-cbse-primary-english-medium",                 medium: "english" },
    3:  { id: 1513, slug: "cbse-class-3-cbse-primary-english-medium",                 medium: "english" },
    4:  { id: 1514, slug: "cbse-class-4-cbse-primary-english-medium",                 medium: "english" },
    5:  { id: 1476, slug: "cbse-class-5-english-medium",                             medium: "english" },
    6:  { id: 1477, slug: "cbse-class-6-english-medium",                             medium: "english" },
    7:  { id: 1442, slug: "cbse-class-7-english-medium",                             medium: "english" },
    8:  { id: 1441, slug: "cbse-class-8-english-medium",                             medium: "english" },
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
    5: [
      { slug: "balbharati-solutions-english-english-standard-5-maharashtra-state-board",              id: "259", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-english-standard-5-maharashtra-state-board",          id: "256", publication: "Balbharati" },
      { slug: "balbharati-solutions-environmental-studies-1-english-standard-5-maharashtra-state-board", id: "257", publication: "Balbharati" },
      { slug: "balbharati-solutions-environmental-studies-2-how-we-came-to-be-english-standard-5-maharashtra-state-board", id: "258", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-sulabhbharati-english-standard-5-maharashtra-state-board",  id: "381", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-sulabhbharati-english-standard-5-maharashtra-state-board", id: "382", publication: "Balbharati" },
    ],
    6: [
      { slug: "balbharati-solutions-english-english-standard-6-maharashtra-state-board",              id: "262", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-english-standard-6-maharashtra-state-board",          id: "182", publication: "Balbharati" },
      { slug: "balbharati-solutions-general-science-english-standard-6-maharashtra-state-board",      id: "184", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-standard-6-maharashtra-state-board",            id: "261", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-civics-english-standard-6-maharashtra-state-board",   id: "260", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-sulabhbharati-english-standard-6-maharashtra-state-board",  id: "281", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-sulabhbharati-english-standard-6-maharashtra-state-board", id: "284", publication: "Balbharati" },
    ],
    7: [
      { slug: "balbharati-solutions-english-english-standard-7-maharashtra-state-board",              id: "263", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-english-standard-7-maharashtra-state-board",          id: "183", publication: "Balbharati" },
      { slug: "balbharati-solutions-general-science-english-standard-7-maharashtra-state-board",      id: "185", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-standard-7-maharashtra-state-board",            id: "265", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-civics-english-standard-7-maharashtra-state-board",   id: "264", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-sulabhbharati-standard-7-maharashtra-state-board",          id: "280", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-sulabhbharati-english-standard-7-maharashtra-state-board", id: "283", publication: "Balbharati" },
    ],
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
    11: [
      { slug: "balbharati-solutions-biology-english-standard-11-maharashtra-state-board",                                     id: "254", publication: "Balbharati" },
      { slug: "balbharati-solutions-book-keeping-and-accountancy-english-standard-11-maharashtra-state-board",                id: "213", publication: "Balbharati" },
      { slug: "balbharati-solutions-chemistry-english-standard-11-maharashtra-state-board",                                   id: "255", publication: "Balbharati" },
      { slug: "balbharati-solutions-economics-english-11-standard",                                                           id: "204", publication: "Balbharati" },
      { slug: "balbharati-solutions-english-yuvakbharati-english-standard-11-maharashtra-state-board",                        id: "202", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-standard-11-maharashtra-state-board",                                   id: "274", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-yuvakbharati-english-standard-11-maharashtra-state-board",                          id: "221", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-english-standard-11-maharashtra-state-board",                                     id: "273", publication: "Balbharati" },
      { slug: "balbharati-solutions-information-technology-english-standard-11-maharashtra-state-board",                      id: "214", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-yuvakbharati-english-standard-11-maharashtra-state-board",                        id: "250", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-arts-and-science-part-1-english-standard-11-maharashtra-state-board", id: "252", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-arts-and-science-part-2-english-standard-11-maharashtra-state-board", id: "253", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-commerce-part-1-english-standard-11-maharashtra-state-board",  id: "249", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-commerce-part-2-english-standard-11-maharashtra-state-board",  id: "247", publication: "Balbharati" },
      { slug: "balbharati-solutions-organisation-of-commerce-and-management-english-standard-11-maharashtra-state-board",     id: "206", publication: "Balbharati" },
      { slug: "balbharati-solutions-physics-english-standard-11-maharashtra-state-board",                                     id: "251", publication: "Balbharati" },
      { slug: "balbharati-solutions-political-science-english-standard-11-maharashtra-state-board",                           id: "272", publication: "Balbharati" },
      { slug: "balbharati-solutions-psychology-english-standard-11-maharashtra-state-board",                                  id: "271", publication: "Balbharati" },
      { slug: "balbharati-solutions-secretarial-practice-english-standard-11-maharashtra-state-board",                        id: "205", publication: "Balbharati" },
      { slug: "balbharati-solutions-sociology-english-standard-11-maharashtra-state-board",                                   id: "270", publication: "Balbharati" },
    ],
    12: [
      { slug: "balbharati-solutions-biology-english-standard-12-maharashtra-state-board",                                     id: "203", publication: "Balbharati" },
      { slug: "balbharati-solutions-book-keeping-and-accountancy-english-standard-12-maharashtra-state-board",                id: "197", publication: "Balbharati" },
      { slug: "balbharati-solutions-chemistry-english-standard-12-maharashtra-state-board",                                   id: "239", publication: "Balbharati" },
      { slug: "balbharati-solutions-economics-english-standard-12-maharashtra-state-board",                                   id: "195", publication: "Balbharati" },
      { slug: "balbharati-solutions-english-yuvakbharati-english-standard-12-maharashtra-state-board",                        id: "201", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-standard-12-maharashtra-state-board",                                   id: "246", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-yuvakbharati-english-standard-12-maharashtra-state-board",                          id: "242", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-english-12-standard-hsc-maharashtra-state-board",                                 id: "244", publication: "Balbharati" },
      { slug: "balbharati-solutions-information-technology-arts-english-standard-12-maharashtra-state-board",                 id: "427", publication: "Balbharati" },
      { slug: "balbharati-solutions-information-technology-commerce-english-standard-12-maharashtra-state-board",             id: "248", publication: "Balbharati" },
      { slug: "balbharati-solutions-information-technology-science-english-standard-12-maharashtra-state-board",              id: "267", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-yuvakbharati-english-standard-12-maharashtra-state-board",                        id: "243", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-1-arts-and-science-english-standard-12-maharashtra-state-board", id: "196", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-2-arts-and-science-english-standard-12-maharashtra-state-board", id: "198", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-1-commerce-english-standard-12-maharashtra-state-board",       id: "215", publication: "Balbharati" },
      { slug: "balbharati-solutions-mathematics-and-statistics-2-commerce-english-standard-12-maharashtra-state-board",       id: "216", publication: "Balbharati" },
      { slug: "balbharati-solutions-organisation-of-commerce-and-management-ocm-english-12-standard-hsc-maharashtra-state-board", id: "240", publication: "Balbharati" },
      { slug: "balbharati-solutions-physics-english-standard-12-maharashtra-state-board",                                     id: "194", publication: "Balbharati" },
      { slug: "balbharati-solutions-political-science-english-standard-12-maharashtra-state-board",                           id: "245", publication: "Balbharati" },
      { slug: "balbharati-solutions-psychology-english-standard-12-maharashtra-state-board",                                  id: "268", publication: "Balbharati" },
      { slug: "balbharati-solutions-secretarial-practice-english-standard-12-maharashtra-state-board",                        id: "241", publication: "Balbharati" },
      { slug: "balbharati-solutions-sociology-understanding-indian-society-english-standard-12-maharashtra-state-board",      id: "269", publication: "Balbharati" },
    ],
  },
  cbse: {
    1: [
      { slug: "ncert-solutions-english-marigold-class-1", id: "452", publication: "NCERT" },
      { slug: "ncert-solutions-english-raindrops-class-1", id: "534", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-rimjhim-class-1", id: "453", publication: "NCERT" },
      { slug: "ncert-solutions-math-magic-english-class-1", id: "454", publication: "NCERT" },
    ],
    2: [
      { slug: "ncert-solutions-english-marigold-class-2", id: "456", publication: "NCERT" },
      { slug: "ncert-solutions-english-raindrops-class-2", id: "535", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-rimjhim-class-2", id: "457", publication: "NCERT" },
      { slug: "ncert-solutions-math-magic-english-class-2", id: "458", publication: "NCERT" },
    ],
    3: [
      { slug: "ncert-solutions-english-marigold-class-3", id: "460", publication: "NCERT" },
      { slug: "ncert-solutions-environmental-studies-looking-around-english-class-3", id: "461", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-rimjhim-class-3", id: "463", publication: "NCERT" },
      { slug: "ncert-solutions-math-magic-english-class-3", id: "465", publication: "NCERT" },
    ],
    4: [
      { slug: "ncert-solutions-english-marigold-class-4", id: "396", publication: "NCERT" },
      { slug: "ncert-solutions-environmental-studies-looking-around-english-class-4", id: "395", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-rimjhim-class-4", id: "397", publication: "NCERT" },
      { slug: "ncert-solutions-math-magic-english-class-4", id: "394", publication: "NCERT" },
    ],
    5: [
      { slug: "ncert-solutions-english-marigold-class-5", id: "391", publication: "NCERT" },
      { slug: "ncert-solutions-environmental-studies-looking-around-english-class-5", id: "392", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-rimjhim-class-5", id: "393", publication: "NCERT" },
      { slug: "ncert-solutions-math-magic-english-class-5", id: "390", publication: "NCERT" },
    ],
    6: [
      { slug: "ncert-solutions-english-a-pact-with-the-sun-class-6", id: "219", publication: "NCERT" },
      { slug: "ncert-solutions-english-honeysuckle-class-6", id: "220", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-bal-ramkatha-class-6", id: "223", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-durva-part-1-class-6", id: "471", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-vasant-part-1-class-6", id: "222", publication: "NCERT" },
      { slug: "rs-aggarwal-solutions-mathematics-english-class-6", id: "169", publication: "RS Aggarwal" },
      { slug: "ncert-solutions-mathematics-english-class-6", id: "217", publication: "NCERT" },
      { slug: "ncert-exemplar-solutions-mathematics-english-class-6", id: "538", publication: "NCERT Exemplar" },
      { slug: "ncert-solutions-sanskrit-ruchira-class-6", id: "473", publication: "NCERT" },
      { slug: "ncert-exemplar-solutions-science-english-class-6", id: "539", publication: "NCERT Exemplar" },
      { slug: "ncert-solutions-science-english-class-6", id: "218", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-our-pasts-1-english-class-6", id: "210", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-social-and-political-life-1-english-class-6", id: "212", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-the-earth-our-habitat-english-class-6", id: "211", publication: "NCERT" },
    ],
    7: [
      { slug: "ncert-solutions-english-an-alien-hand-class-7", id: "72", publication: "NCERT" },
      { slug: "ncert-solutions-english-honeycomb-class-7", id: "71", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-bal-mahabharat-katha-class-7", id: "224", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-durva-part-2-class-7", id: "225", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-vasant-part-2-class-7", id: "226", publication: "NCERT" },
      { slug: "ncert-exemplar-solutions-mathematics-english-class-7", id: "550", publication: "NCERT Exemplar" },
      { slug: "ncert-solutions-mathematics-english-class-7", id: "24", publication: "NCERT" },
      { slug: "ncert-solutions-sanskrit-ruchira-class-7", id: "557", publication: "NCERT" },
      { slug: "ncert-solutions-science-english-class-7", id: "23", publication: "NCERT" },
      { slug: "ncert-exemplar-solutions-science-english-class-7", id: "551", publication: "NCERT Exemplar" },
      { slug: "ncert-solutions-social-science-our-environment-english-class-7", id: "209", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-our-pasts-2-english-class-7", id: "208", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-social-and-political-life-2-english-class-7", id: "207", publication: "NCERT" },
    ],
    8: [
      { slug: "ncert-solutions-english-honeydew-class-8", id: "70", publication: "NCERT" },
      { slug: "ncert-solutions-english-it-so-happened-class-8", id: "69", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-bharat-ki-khoj-class-8", id: "227", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-durva-part-3-class-8", id: "228", publication: "NCERT" },
      { slug: "ncert-solutions-hindi-vasant-part-3-class-8", id: "229", publication: "NCERT" },
      { slug: "rd-sharma-solutions-mathematics-english-class-8", id: "64", publication: "RD Sharma" },
      { slug: "ncert-solutions-mathematics-english-class-8", id: "22", publication: "NCERT" },
      { slug: "ncert-solutions-sanskrit-ruchira-class-8", id: "558", publication: "NCERT" },
      { slug: "ncert-solutions-science-english-class-8", id: "21", publication: "NCERT" },
      { slug: "ncert-exemplar-solutions-science-exemplar-english-class-8", id: "554", publication: "NCERT Exemplar" },
      { slug: "ncert-solutions-social-science-our-pasts-3-english-class-8", id: "98", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-resources-and-development-english-class-8", id: "99", publication: "NCERT" },
      { slug: "ncert-solutions-social-science-social-and-political-life-3-english-class-8", id: "100", publication: "NCERT" },
    ],
    9: [
      { slug: "rd-sharma-solutions-mathematics-english-class-9", id: "43", publication: "RD Sharma" },
      { slug: "ncert-solutions-mathematics-english-class-9", id: "19", publication: "NCERT" },
      { slug: "ncert-solutions-science-english-class-9", id: "20", publication: "NCERT" },
    ],
    10: [
      { slug: "rd-sharma-solutions-mathematics-english-class-10", id: "25", publication: "RD Sharma" },
      { slug: "ncert-solutions-mathematics-english-class-10", id: "17", publication: "NCERT" },
      { slug: "ncert-solutions-science-english-class-10", id: "18", publication: "NCERT" },
    ],
    11: [
      { slug: "ncert-solutions-mathematics-english-class-11", id: "14", publication: "NCERT" },
      { slug: "ncert-solutions-physics-english-class-11", id: "16", publication: "NCERT" },
      { slug: "ncert-solutions-chemistry-part-1-and-2-english-class-11", id: "13", publication: "NCERT" },
      { slug: "ncert-solutions-biology-english-class-11", id: "11", publication: "NCERT" },
    ],
    12: [
      { slug: "ncert-solutions-mathematics-part-1-and-2-english-class-12", id: "7", publication: "NCERT" },
      { slug: "ncert-solutions-physics-part-i-and-ii-english-class-12", id: "10", publication: "NCERT" },
      { slug: "ncert-solutions-chemistry-part-1-and-2-english-class-12", id: "5", publication: "NCERT" },
      { slug: "ncert-solutions-biology-english-class-12", id: "4", publication: "NCERT" },
    ],
  },
  icse: {
    10: [
      { slug: "selina-solutions-concise-mathematics-english-class-10-icse", id: "29", publication: "Selina" },
      { slug: "selina-solutions-concise-biology-english-class-10-icse", id: "30", publication: "Selina" },
      { slug: "sp-singh-solutions-concise-chemistry-english-class-10-icse", id: "31", publication: "SP Singh" },
      { slug: "frank-solutions-mathematics-part-2-english-class-10-icse", id: "130", publication: "Frank" },
      { slug: "frank-solutions-chemistry-part-2-english-class-10-icse", id: "132", publication: "Frank" },
      { slug: "frank-solutions-biology-part-2-english-class-10-icse", id: "133", publication: "Frank" },
    ],
  },
};
