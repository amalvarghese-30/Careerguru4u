/**
 * Chapter discovery — fetches a textbook page and extracts chapter links.
 */
import { fetchPage } from "../crawler/fetcher";
import { markVisited } from "../crawler/cache";
import { extractChapterLinks } from "./link-extractor";
import type { DiscoveredChapter } from "../types";

export async function discoverChapters(textbookUrl: string): Promise<DiscoveredChapter[]> {
  try {
    const { html } = await fetchPage(textbookUrl);
    markVisited(textbookUrl, 200, "chapter_list");
    return extractChapterLinks(html);
  } catch {
    return [];
  }
}
