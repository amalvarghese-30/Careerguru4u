/**
 * Playwright-based fetcher for JS-heavy pages that require browser rendering.
 *
 * Uses the existing Playwright singleton from the old crawler system.
 * Reserved for pages where plain HTTP fetch can't see the full content
 * (SearchTextbookSolutions pagination, login walls, lazy-loaded content).
 *
 * Individual solution pages still use static fetch — Playwright triggers
 * bot detection on those, and the server-rendered HTML has full QAPage data.
 */
import type { Page } from "playwright";
import { getBrowser, newPage } from "../../crawler/utils/browser";
import { DELAY_MS, MAX_RETRIES, REQUEST_TIMEOUT } from "../config";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch a dynamic page using Playwright with retry logic.
 * Returns the full rendered HTML after scroll-triggering lazy content.
 */
export async function fetchDynamicPage(url: string): Promise<{ html: string; page: Page }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const page = await newPage();
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: REQUEST_TIMEOUT,
      });

      // Wait for main content
      await page.waitForSelector("main, .main-content, #content, body", { timeout: 10_000 }).catch(() => {});

      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1000);

      // Scroll back up and down to trigger any viewport-based loading
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1000);

      const html = await page.content();
      return { html, page };
    } catch (err) {
      lastError = err as Error;
      try { await page.close(); } catch {}
      if (attempt < MAX_RETRIES) {
        console.warn(`[PW] Retry ${attempt}/${MAX_RETRIES} for ${url}`);
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`[PW] Failed to fetch ${url}: ${lastError?.message}`);
}

/**
 * Convenience wrapper returning just the HTML string.
 */
export async function fetchDynamicHtml(url: string): Promise<string> {
  const { html, page } = await fetchDynamicPage(url);
  await page.close();
  return html;
}

/**
 * Fetch a page and return both the HTML and an open page reference
 * (for callers that need to extract links from the live DOM).
 */
export async function fetchDynamicPageForDiscovery(url: string): Promise<{ html: string; page: Page }> {
  return fetchDynamicPage(url);
}
