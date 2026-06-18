/**
 * Core shared types for the CareerGuru4U ingestion pipeline.
 *
 * Every parsed HTML node becomes a typed ContentBlock — text, equations,
 * tables, images, etc. — never raw HTML strings.
 */

// ─── Block Types ───────────────────────────────────────────────────

export const BLOCK_TYPES = [
  "paragraph",
  "heading",
  "equation",
  "inline-math",
  "table",
  "image",
  "svg",
  "ordered-list",
  "unordered-list",
  "list-item",
  "formula-box",
  "example-box",
  "warning-box",
  "important-box",
  "definition-box",
  "code-block",
  "quote",
  "horizontal-rule",
  "figure",
  "caption",
  "superscript",
  "subscript",
  "hyperlink",
  "reference",
  "video",
  "audio",
  "download-link",
  "unknown",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// ─── Content Blocks ────────────────────────────────────────────────

export interface ContentBlock {
  type: BlockType;
  id: string;
  content?: string;
  children?: ContentBlock[];
  attrs?: Record<string, unknown>;
}

// ─── Solution Steps ────────────────────────────────────────────────

export interface SolutionStep {
  stepNumber: number;
  title?: string;
  blocks: ContentBlock[];
}

// ─── Asset References ──────────────────────────────────────────────

export interface ImageRef {
  blockId: string;
  url: string;
  localPath: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType: string;
}

export interface TableRef {
  blockId: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  colCount: number;
  rowCount: number;
}

export interface EquationRef {
  blockId: string;
  latex: string;
  unicode: string;
  isDisplay: boolean;
}

// ─── Solution Document ─────────────────────────────────────────────

export interface Solution {
  _id?: string;

  // Identity
  board: BoardKey;
  class: number;
  subject: string;
  chapter: string;
  questionNumber: string;

  // Source tracking
  sourceUrl: string;
  sourceType: "scraped" | "manual" | "ai-enhanced";

  // Structured content
  question: ContentBlock[];
  solution: SolutionStep[];

  // Metadata
  questionType?: "mcq" | "short" | "long" | "diagram" | "numerical" | "derivation";
  difficulty?: "easy" | "medium" | "hard";
  hints?: ContentBlock[];
  images: ImageRef[];
  tables: TableRef[];
  equations: EquationRef[];

  // Versioning
  originalData?: { question: ContentBlock[]; solution: SolutionStep[] };
  aiEnhancedData?: { question: ContentBlock[]; solution: SolutionStep[] };
  version: number;

  // Stats
  isFree: boolean;
  viewCount: number;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Discovery Types ───────────────────────────────────────────────

export interface DiscoveredBoard {
  name: string;
  key: string;
  url: string;
}

export interface DiscoveredClass {
  classNum: number;
  courseId: number;
  courseSlug: string;
  medium: string;
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

// ─── Board / Config Types ──────────────────────────────────────────

export type BoardKey = "maharashtra" | "cbse" | "icse";

export interface BoardConfig {
  key: BoardKey;
  name: string;
  url: string;
}

export interface CourseEntry {
  id: number;
  slug: string;
  medium: string;
}

export interface KnownTextbook {
  slug: string;
  id: string;
  publication: string;
}

// ─── Crawl / Validation ────────────────────────────────────────────

export interface CrawlStats {
  startTime: string;
  endTime?: string;
  boardsFound: number;
  classesFound: number;
  subjectsFound: number;
  booksFound: number;
  chaptersFound: number;
  questionsFound: number;
  solutionsFound: number;
  pdfsFound: number;
  pdfsDownloaded: number;
  imagesDownloaded: number;
  coversDownloaded: number;
  failedDownloads: number;
  duplicatesSkipped: number;
  validationIssues: number;
  errors: string[];
}

export interface ValidationIssue {
  url: string;
  board: string;
  class: number;
  subject: string;
  chapter: string;
  questionNumber: string;
  issue: string;
  severity: "warning" | "error";
  field: string;
}

// ─── Parsed Page ───────────────────────────────────────────────────

export interface ParsedPage {
  url: string;
  title: string;
  blocks: ContentBlock[];
  images: ImageRef[];
  tables: TableRef[];
  equations: EquationRef[];
  rawHtml: string;
  parseErrors: string[];
}
