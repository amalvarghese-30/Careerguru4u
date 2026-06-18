/**
 * Fetcher — robust page loading with retry logic using Playwright.
 */
import { Page } from "playwright";
import { newPage } from "./browser";
import { DELAY_MS, MAX_RETRIES, REQUEST_TIMEOUT } from "../config/index";
import { logger } from "./logger";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchPage(url: string): Promise<{ html: string; page: Page }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const page = await newPage();
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: REQUEST_TIMEOUT,
      });

      // Wait for main content to appear
      await page.waitForSelector("main, .main-content, body", { timeout: 10000 }).catch(() => {});

      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1000);

      const html = await page.content();
      await page.close();
      return { html, page };
    } catch (err) {
      lastError = err as Error;
      try { await page.close(); } catch {}
      if (attempt < MAX_RETRIES) {
        logger.warn(`Retry ${attempt}/${MAX_RETRIES} for ${url}`);
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError?.message}`);
}

export async function fetchPageHtml(url: string): Promise<string> {
  const { html } = await fetchPage(url);
  return html;
}

/**
 * Fetches a Shaalaa question-bank-solutions page using plain HTTP fetch.
 * Playwright triggers bot detection/redirects on these pages, but the
 * server-rendered HTML contains the full QAPage JSON-LD with answer text.
 */
export async function fetchSolutionPage(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();

      // Verify we got a solution page (not a redirect to listing)
      if (html.includes("QAPage") || html.includes("qbq_text_solution") || html.includes("question-bank-solutions")) {
        return html;
      }

      // May have hit a soft redirect — check title
      if (html.includes("<title>Textbook Solutions | Shaalaa.com</title>") || html.includes("Log in") && html.includes("Forgot password") && !html.includes("QAPage")) {
        logger.warn(`Solution page redirected to listing — may require auth: ${url}`);
        return html; // Return anyway, parser will handle missing data
      }

      return html;
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES) {
        logger.warn(`Retry ${attempt}/${MAX_RETRIES} for ${url}`);
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to fetch solution ${url}: ${lastError?.message}`);
}

export async function fetchWithDelay(url: string): Promise<string> {
  await sleep(DELAY_MS);
  return fetchPageHtml(url);
}

export async function downloadFile(
  url: string,
  destPath: string
): Promise<{ success: boolean; size: number }> {
  const page = await newPage();
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    if (!response || !response.ok()) {
      await page.close();
      return { success: false, size: 0 };
    }
    const buffer = await response.body();
    const fs = await import("fs");
    fs.writeFileSync(destPath, buffer);
    await page.close();
    return { success: true, size: buffer.length };
  } catch (err) {
    try { await page.close(); } catch {}
    logger.error(`Download failed: ${url} — ${(err as Error).message}`);
    return { success: false, size: 0 };
  }
}
