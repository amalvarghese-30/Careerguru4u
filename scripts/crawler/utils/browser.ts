/**
 * Browser manager — handles Playwright browser lifecycle with proper cleanup.
 */
import { chromium, Browser, BrowserContext, Page } from "playwright";
import { NAVIGATION_TIMEOUT } from "../config/index";

let browser: Browser | null = null;
let context: BrowserContext | null = null;

export async function getBrowser(): Promise<{ browser: Browser; context: BrowserContext }> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
  if (!context) {
    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    context.setDefaultTimeout(NAVIGATION_TIMEOUT);
  }
  return { browser, context };
}

export async function newPage(): Promise<Page> {
  const { context } = await getBrowser();
  return context.newPage();
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
}
