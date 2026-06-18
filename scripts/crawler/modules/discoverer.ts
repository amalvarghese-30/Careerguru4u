/**
 * Discovery module — automatically finds all boards, classes, subjects, textbooks,
 * chapters, and questions on Shaalaa.com by crawling from the starting URL.
 */
import { fetchPageHtml } from "../utils/fetcher";
import { cache } from "../utils/cache";
import { logger } from "../utils/logger";
import { normalizeUrl, slugify, normalizeBoardKey } from "../utils/normalize";
import {
  extractSubjectLinks,
  extractTextbookLinks,
  extractChapterLinks,
  extractQuestionLinks,
} from "../utils/html-parser";
import { BASE_URL, COURSE_IDS, PUBLICATION_PATTERNS } from "../config/index";

// Hardcoded known textbook IDs that Shaalaa's subject filter doesn't surface correctly.
// These are verified textbook IDs for boards where discovery fails.
const KNOWN_TEXTBOOKS: Record<string, Record<number, Array<{ slug: string; id: string; publication: string }>>> = {
  maharashtra: {
    8: [
      { slug: "balbharati-solutions-mathematics-english-standard-8-maharashtra-state-board", id: "117", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-english-8-standard-maharashtra-state-board", id: "116", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-civics-english-8-standard-maharashtra-state-board", id: "118", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-8-standard-maharashtra-state-board", id: "119", publication: "Balbharati" },
      { slug: "balbharati-solutions-english-english-8-standard-maharashtra-state-board", id: "120", publication: "Balbharati" },
      { slug: "balbharati-solutions-hindi-english-8-standard-maharashtra-state-board", id: "121", publication: "Balbharati" },
      { slug: "balbharati-solutions-marathi-english-8-standard-maharashtra-state-board", id: "122", publication: "Balbharati" },
    ],
    9: [
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-9-maharashtra-state-board", id: "54", publication: "Balbharati" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-9-maharashtra-state-board", id: "55", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-and-technology-english-9-standard-maharashtra-state-board", id: "56", publication: "Balbharati" },
      { slug: "balbharati-solutions-history-and-political-science-english-9-standard-maharashtra-state-board", id: "57", publication: "Balbharati" },
      { slug: "balbharati-solutions-geography-english-9-standard-maharashtra-state-board", id: "58", publication: "Balbharati" },
    ],
    10: [
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-10-maharashtra-state-board", id: "52", publication: "Balbharati" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-10-maharashtra-state-board", id: "50", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-and-technology-part-1-english-standard-10-maharashtra-state-board", id: "51", publication: "Balbharati" },
      { slug: "balbharati-solutions-science-and-technology-2-english-standard-10-maharashtra-state-board", id: "53", publication: "Balbharati" },
    ],
  },
};

export interface DiscoveredBoard {
  name: string;
  key: string;
  url: string;
}

export interface DiscoveredClass {
  classNum: number;
  courseId: number;
  courseSlug: string;
}

export interface DiscoveredSubject {
  name: string;
  slug: string;
  id: string;
  url: string;
}

export interface DiscoveredTextbook {
  url: string;
  id: string;
  slug: string;
  publication: string;
}

export interface DiscoveredChapter {
  name: string;
  slug: string;
  id: string;
  url: string;
}

export interface DiscoveredQuestion {
  url: string;
  id: string;
  slug: string;
}

export async function discoverBoards(startUrl: string): Promise<DiscoveredBoard[]> {
  const boards: DiscoveredBoard[] = [];
  try {
    const html = await fetchPageHtml(startUrl);
    cache.markVisited(startUrl, 200, "board_list");

    // Extract board links from study-material page
    const boardRegex = /\/study-material\/([a-z0-9-]+)_(\d+)/gi;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = boardRegex.exec(html)) !== null) {
      const slug = match[1];
      const id = match[2];
      if (seen.has(slug)) continue;
      seen.add(slug);

      let name = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/_/g, "")
        .replace(/\bBoard\b.*$/i, "Board")
        .trim();

      if (name.toLowerCase().includes("maharashtra")) name = "Maharashtra Board";
      else if (name.toLowerCase().includes("cbse") || name.toLowerCase().includes("central")) name = "CBSE";
      else if (name.toLowerCase().includes("cisce") || name.toLowerCase().includes("icse")) name = "ICSE";

      boards.push({
        name,
        key: normalizeBoardKey(name),
        url: `${BASE_URL}/study-material/${slug}_${id}`,
      });
    }
  } catch (err) {
    logger.error(`Failed to discover boards: ${(err as Error).message}`);
  }
  return boards;
}

export async function discoverClasses(boardKey: string): Promise<DiscoveredClass[]> {
  const classes: DiscoveredClass[] = [];
  const courseMap = COURSE_IDS[boardKey];
  if (!courseMap) {
    logger.warn(`No course IDs for board: ${boardKey}`);
    return classes;
  }

  for (const [classNum, course] of Object.entries(courseMap)) {
    classes.push({
      classNum: parseInt(classNum),
      courseId: course.id,
      courseSlug: course.slug,
    });
  }

  return classes.sort((a, b) => a.classNum - b.classNum);
}

export async function discoverSubjects(
  boardKey: string,
  classNum: number
): Promise<DiscoveredSubject[]> {
  const course = COURSE_IDS[boardKey]?.[classNum];
  if (!course) return [];

  const url = `${BASE_URL}/search-textbook-solutions/${course.slug}_${course.id}`;
  try {
    const html = await fetchPageHtml(url);
    cache.markVisited(url, 200, "subject_list");
    const subjects = extractSubjectLinks(html);
    logger.info(`Board=${boardKey} Class=${classNum}: ${subjects.length} subjects found`);
    return subjects;
  } catch (err) {
    logger.error(`Subject discovery failed: ${(err as Error).message}`);
    return [];
  }
}

export async function discoverTextbooks(
  boardKey: string,
  classNum: number,
  subjectSlug: string,
  subjectName: string,
  subjectId: string
): Promise<DiscoveredTextbook[]> {
  const course = COURSE_IDS[boardKey]?.[classNum];
  if (!course) return [];

  const url = `${BASE_URL}/search-textbook-solutions/${course.slug}_${course.id}?subjects=${subjectSlug}_${subjectId}`;
  try {
    const html = await fetchPageHtml(url);
    cache.markVisited(url, 200, "textbook_list");

    let textbooks = extractTextbookLinks(html);

    // Filter by board-specific publication patterns AND class number in slug
    const patterns = PUBLICATION_PATTERNS[boardKey] || [];
    textbooks = textbooks.filter((tb) => {
      const matchesBoard = patterns.some((p) => tb.slug.includes(p));
      if (!matchesBoard) return false;
      // Check class number in the slug
      const classPatterns = [
        `-standard-${classNum}`,
        `-${classNum}th-standard`,
        `-${classNum}-`,
        `-class-${classNum}`,
        `-class-${classNum}-`,
        `-${classNum}th-`,
      ];
      return classPatterns.some((p) => tb.slug.includes(p));
    });

    // If board filter returned nothing but we know this board has textbooks, try known IDs
    if (textbooks.length === 0) {
      const known = KNOWN_TEXTBOOKS[boardKey]?.[classNum];
      if (known) {
        // Match known textbooks to the subject
        const subjLower = subjectName.toLowerCase();
        let filtered = known;
        if (subjLower.includes("math") || subjLower.includes("algebra") || subjLower.includes("geometry")) {
          filtered = known.filter(t => t.slug.includes("mathematics") || t.slug.includes("algebra") || t.slug.includes("geometry"));
        } else if (subjLower.includes("physics")) {
          filtered = known.filter(t => t.slug.includes("science-and-technology-part-1") || t.slug.includes("science-and-technology-1") || t.slug.includes("physics"));
        } else if (subjLower.includes("chemistry")) {
          filtered = known.filter(t => t.slug.includes("science-and-technology-part-1") || t.slug.includes("science-and-technology-1") || t.slug.includes("chemistry"));
        } else if (subjLower.includes("biology")) {
          filtered = known.filter(t => t.slug.includes("science-and-technology-2") || t.slug.includes("biology"));
        } else if (subjLower.includes("science") || subjLower.includes("tech")) {
          filtered = known.filter(t =>
            t.slug.includes("science-and-technology") || t.slug.includes("-science-")
          );
        } else if (subjLower.includes("history")) {
          filtered = known.filter(t => t.slug.includes("history"));
        } else if (subjLower.includes("geography")) {
          filtered = known.filter(t => t.slug.includes("geography"));
        } else if (subjLower.includes("english")) {
          filtered = known.filter(t => t.slug.includes("english"));
        } else if (subjLower.includes("hindi")) {
          filtered = known.filter(t => t.slug.includes("hindi"));
        } else if (subjLower.includes("marathi")) {
          filtered = known.filter(t => t.slug.includes("marathi"));
        } else {
          filtered = [];
        }

        textbooks = filtered.map(t => ({
          url: `${BASE_URL}/textbook-solutions/${t.slug}_${t.id}`,
          id: t.id,
          slug: t.slug,
        }));
        if (textbooks.length > 0) logger.info(`  Using known textbook IDs as fallback`);
      }
    }

    const result = textbooks.map((tb) => ({
      ...tb,
      publication: detectPublicationFromSlug(tb.slug, boardKey),
    }));

    logger.info(`${subjectName}: ${result.length} textbooks`);
    return result;
  } catch (err) {
    logger.error(`Textbook discovery failed: ${(err as Error).message}`);
    return [];
  }
}

export async function discoverChapters(textbookUrl: string): Promise<DiscoveredChapter[]> {
  try {
    const html = await fetchPageHtml(textbookUrl);
    cache.markVisited(textbookUrl, 200, "chapter_list");
    return extractChapterLinks(html);
  } catch (err) {
    logger.error(`Chapter discovery failed: ${(err as Error).message}`);
    return [];
  }
}

export async function discoverQuestions(chapterUrl: string): Promise<DiscoveredQuestion[]> {
  try {
    const html = await fetchPageHtml(chapterUrl);
    cache.markVisited(chapterUrl, 200, "question_list");
    return extractQuestionLinks(html);
  } catch (err) {
    logger.error(`Question discovery failed: ${(err as Error).message}`);
    return [];
  }
}

function detectPublicationFromSlug(slug: string, boardKey: string): string {
  const map: Record<string, Record<string, string>> = {
    maharashtra: {
      balbharati: "Balbharati",
      target: "Target Publications",
      navneet: "Navneet",
    },
    cbse: {
      ncert: "NCERT",
      "rd-sharma": "RD Sharma",
      "rs-aggarwal": "RS Aggarwal",
      "hc-verma": "HC Verma",
      oswal: "Oswal",
      evergreen: "Evergreen",
      "lakhmir-singh": "Lakhmir Singh",
    },
    icse: {
      selina: "Selina Publishers",
      concise: "Concise",
      "ml-aggarwal": "ML Aggarwal",
      frank: "Frank Brothers",
      evergreen: "Evergreen",
    },
  };

  const boardMap = map[boardKey] || {};
  for (const [pattern, name] of Object.entries(boardMap)) {
    if (slug.includes(pattern)) return name;
  }
  return "General";
}
