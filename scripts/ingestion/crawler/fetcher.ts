/**
 * Fetcher — robust page loading with retry logic.
 *
 * Uses plain HTTP fetch() for both listing pages and solution pages.
 * Playwright is reserved for JS-heavy pages that require a real browser
 * (login flows, SearchTextbookSolutions pagination, etc.).
 */
import * as fs from "fs";
import { DELAY_MS, MAX_RETRIES, REQUEST_TIMEOUT, USER_AGENT } from "../config";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const DEFAULT_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

export interface FetchResult {
  html: string;
  url: string;
  status: number;
  cached: boolean;
}

/**
 * Fetch any page with retry logic. Returns HTML string.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const html = await res.text();

      return {
        html,
        url: res.url,
        status: res.status,
        cached: false,
      };
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES) {
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

/**
 * Fetch a Shaalaa question-bank-solutions page using plain HTTP fetch.
 * Playwright triggers bot detection/redirects on these pages; plain fetch
 * gets server-rendered HTML with full QAPage JSON-LD.
 */
export async function fetchSolutionPage(url: string): Promise<FetchResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();

      // Validate we got real solution content
      const hasContent =
        html.includes("QAPage") ||
        html.includes("qbq_text_solution") ||
        html.includes("question-bank-solutions");

      if (hasContent) {
        return { html, url: res.url, status: res.status, cached: false };
      }

      // Soft redirect to login wall — return anyway, parser handles missing data
      return { html, url: res.url, status: res.status, cached: false };
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES) {
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to fetch solution ${url}: ${lastError?.message}`);
}

/**
 * Download a binary file (image, PDF) to disk. Returns success + byte size.
 */
export async function downloadFile(url: string, destPath: string): Promise<{ success: boolean; size: number }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60_000);

      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return { success: false, size: 0 };

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(require("path").dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, buffer);
      return { success: true, size: buffer.length };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return { success: false, size: 0 };
      }
      await sleep(DELAY_MS * attempt);
    }
  }

  return { success: false, size: 0 };
}
