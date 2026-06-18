/**
 * Question discovery — fetches a chapter page and extracts question links.
 */
import { fetchPage } from "../crawler/fetcher";
import { markVisited } from "../crawler/cache";
import { extractQuestionLinks } from "./link-extractor";
import type { DiscoveredQuestion } from "../types";

export async function discoverQuestions(chapterUrl: string): Promise<DiscoveredQuestion[]> {
  try {
    const { html } = await fetchPage(chapterUrl);
    markVisited(chapterUrl, 200, "question_list");
    return extractQuestionLinks(html);
  } catch {
    return [];
  }
}
