/**
 * Board discovery — extracts board links from the Shaalaa study-material page,
 * or falls back to the hardcoded BOARDS registry.
 */
import { fetchPage } from "../crawler/fetcher";
import { markVisited } from "../crawler/cache";
import { BASE_URL, START_URL } from "../config";
import { BOARDS, getBoardName } from "../config/boards";
import type { BoardKey, DiscoveredBoard } from "../types";

function normalizeBoardKeyFromName(name: string): BoardKey {
  const lower = name.toLowerCase();
  if (lower.includes("maharashtra")) return "maharashtra";
  if (lower.includes("cbse") || lower.includes("central")) return "cbse";
  if (lower.includes("cisce") || lower.includes("icse")) return "icse";
  return "cbse";
}

export async function discoverBoards(startUrl: string = START_URL): Promise<DiscoveredBoard[]> {
  const boards: DiscoveredBoard[] = [];
  const seen = new Set<string>();

  try {
    const { html } = await fetchPage(startUrl);
    markVisited(startUrl, 200, "board_list");

    const boardRegex = /\/study-material\/([a-z0-9-]+)_(\d+)/gi;
    let match: RegExpExecArray | null;

    while ((match = boardRegex.exec(html)) !== null) {
      const slug = match[1];
      const id = match[2];
      if (seen.has(slug)) continue;
      seen.add(slug);

      let name = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/_/g, "")
        .replace(/\bBoard\b.*$/i, "Board")
        .trim();

      if (name.toLowerCase().includes("maharashtra")) name = "Maharashtra Board";
      else if (name.toLowerCase().includes("cbse") || name.toLowerCase().includes("central")) name = "CBSE";
      else if (name.toLowerCase().includes("cisce") || name.toLowerCase().includes("icse")) name = "ICSE";

      boards.push({
        name,
        key: normalizeBoardKeyFromName(name),
        url: `${BASE_URL}/study-material/${slug}_${id}`,
      });
    }
  } catch {
    // Fallback to hardcoded registry
  }

  // If discovery fails or returns nothing, use hardcoded registry
  if (boards.length === 0) {
    for (const [key, config] of Object.entries(BOARDS)) {
      boards.push({
        name: config.name,
        key: key as BoardKey,
        url: config.url,
      });
    }
  }

  return boards;
}
