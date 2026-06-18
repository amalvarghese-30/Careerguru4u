/**
 * Lightweight regex-based link extraction for Shaalaa.com.
 *
 * These only extract URLs from HTML — no content parsing. The heavy
 * DOM-to-blocks conversion lives in the parser module (Step 4).
 */
import { BASE_URL } from "../config";

// ─── Subject Name Normalization ──────────────────────────────────────

/**
 * Shaalaa subject slugs are URL-encoded but not always human-readable.
 * Map known slugs to proper display names.
 */
const SUBJECT_NAME_MAP: Record<string, string> = {
  "english-2-literature-english-class": "English",
  "history-and-civics-class": "History and Civics",
  "english-1-english-language-class": "English Language",
  "english-2-literature-in-english": "English Literature",
  "physics-chemistry-biology": "Science",
};

function normalizeSubjectName(slug: string): string {
  if (SUBJECT_NAME_MAP[slug]) return SUBJECT_NAME_MAP[slug];
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Subjects ─────────────────────────────────────────────────────────

export interface SubjectLink {
  name: string;
  slug: string;
  id: string;
  url: string;
}

export function extractSubjectLinks(html: string): SubjectLink[] {
  const subjects: SubjectLink[] = [];
  const regex = /href="([^"]*\?subjects=([^"&]+)_(\d+))"/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const fullHref = match[1];
    const slug = match[2];
    const id = match[3];
    if (seen.has(id)) continue;
    seen.add(id);

    const name = normalizeSubjectName(slug);
    const url = fullHref.startsWith("http") ? fullHref : `${BASE_URL}${fullHref}`;
    subjects.push({ name, slug, id, url });
  }
  return subjects;
}

// ─── Textbooks ────────────────────────────────────────────────────────

export interface TextbookLink {
  url: string;
  id: string;
  slug: string;
}

export function extractTextbookLinks(html: string): TextbookLink[] {
  const textbooks: TextbookLink[] = [];
  const regex = /\/textbook-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    textbooks.push({
      url: `${BASE_URL}/textbook-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return textbooks;
}

// ─── Chapters ─────────────────────────────────────────────────────────

export interface ChapterLink {
  name: string;
  slug: string;
  id: string;
  url: string;
}

export function extractChapterLinks(html: string): ChapterLink[] {
  const chapters: ChapterLink[] = [];
  const regex = /\/textbook-solutions\/c\/([a-z0-9][a-z0-9-.]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);

    // Try extracting from "-chapter-{num}-{name}" suffix first
    let name = "";
    const chapterPartMatch = slug.match(/-chapter-(\d+)-(.+)$/i);
    if (chapterPartMatch) {
      name = chapterPartMatch[2]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    // Also try anchor text
    const linkRegex = new RegExp(
      `<a[^>]*href="[^"]*\\/c\\/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_${id}"[^>]*>([\\s\\S]*?)<\\/a>`,
      "i"
    );
    const linkMatch = html.match(linkRegex);
    let anchorText = "";
    if (linkMatch) {
      anchorText = linkMatch[1].replace(/<[^>]+>/g, "").trim();
      anchorText = anchorText.replace(/^[\s•\-•\d]+:?\s*/i, "").trim();
    }

    // Prefer anchor text if it looks like a real chapter name
    if (anchorText && !/^exercises?$/i.test(anchorText) && anchorText.length >= 2) {
      if (!name || anchorText.length > name.length) {
        name = anchorText;
      }
    }

    // Fallback: derive from slug
    if (!name || name.length < 3) {
      name = slug
        .replace(/^(balbharati|ncert|selina|ml-aggarwal|rd-sharma|frank)-solutions-/i, "")
        .replace(/-english-?(standard|medium)?-?\d*.*$/, "")
        .replace(/^mathematics-\d-|^science-and-technology-/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    if (!name || name.length < 3) {
      name = `Chapter ${chapters.length + 1}`;
    }

    chapters.push({ name, slug, id, url: `${BASE_URL}/textbook-solutions/c/${slug}_${id}` });
  }
  return chapters;
}

// ─── Questions ────────────────────────────────────────────────────────

export interface QuestionLink {
  url: string;
  id: string;
  slug: string;
}

export function extractQuestionLinks(html: string): QuestionLink[] {
  const questions: QuestionLink[] = [];
  const regex = /\/question-bank-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    questions.push({
      url: `${BASE_URL}/question-bank-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return questions;
}
