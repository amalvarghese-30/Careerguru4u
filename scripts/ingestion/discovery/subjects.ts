/**
 * Subject discovery — fetches the subject listing page for a board+class
 * and extracts all available subjects.
 */
import { fetchPage } from "../crawler/fetcher";
import { markVisited } from "../crawler/cache";
import { getSubjectSearchUrl } from "../config/boards";
import { extractSubjectLinks } from "./link-extractor";
import type { BoardKey, DiscoveredSubject } from "../types";

export async function discoverSubjects(boardKey: BoardKey, classNum: number): Promise<DiscoveredSubject[]> {
  try {
    const url = getSubjectSearchUrl(boardKey, classNum);
    const { html } = await fetchPage(url);
    markVisited(url, 200, "subject_list");

    return extractSubjectLinks(html);
  } catch {
    return [];
  }
}
