/**
 * Core configuration — base URL, timing, concurrency, and output paths.
 *
 * This is the single source of truth. The old config at
 * scripts/crawler/config/index.ts and the constants in
 * scripts/scrape-shaalaa.mjs are deprecated.
 */

// ─── Network ────────────────────────────────────────────────────────

export const BASE_URL = "https://www.shaalaa.com";
export const DELAY_MS = 1500;
export const MAX_RETRIES = 3;
export const REQUEST_TIMEOUT = 30_000;

// ─── Concurrency ────────────────────────────────────────────────────

export const MAX_PARALLEL_DISCOVERY = 2;
export const MAX_PARALLEL_SCRAPE = 4;
export const MAX_PARALLEL_DOWNLOADS = 2;

// ─── Output ────────────────────────────────────────────────────────

export const OUTPUT_DIR = "academic-library";
export const CACHE_DIR = `${OUTPUT_DIR}/cache`;
export const HTML_DIR = `${OUTPUT_DIR}/html`;
export const BLOCKS_DIR = `${OUTPUT_DIR}/blocks`;
export const SOLUTIONS_DIR = `${OUTPUT_DIR}/solutions`;
export const ASSETS_DIR = `${OUTPUT_DIR}/assets`;
export const PDFS_DIR = `${OUTPUT_DIR}/pdfs`;
export const REPORTS_DIR = `${OUTPUT_DIR}/reports`;
export const REVIEW_DIR = `${OUTPUT_DIR}/review`;

// ─── User agent (plain fetch, not Playwright) ───────────────────────

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Starting point ─────────────────────────────────────────────────

export const START_URL = `${BASE_URL}/study-material`;
