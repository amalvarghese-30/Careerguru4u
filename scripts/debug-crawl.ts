/**
 * Debug script: check what the Shaalaa subject page actually returns.
 */
import { fetchPageHtml } from "./crawler/utils/fetcher";
import { extractTextbookLinks, extractChapterLinks } from "./crawler/utils/html-parser";
import { closeBrowser } from "./crawler/utils/browser";

async function main() {
  const url = "https://www.shaalaa.com/search-textbook-solutions/maharashtra-board-10th-standard-ssc-english-medium_1440?subjects=physics_8414";
  console.log("Fetching:", url);
  const html = await fetchPageHtml(url);
  console.log("HTML length:", html.length);

  // Show the textbook solution links area
  const linkArea = html.match(/textbook-solutions[^"]*_(\d+)/gi);
  console.log("\nTextbook solution matches:", linkArea?.length || 0);
  if (linkArea) linkArea.slice(0, 10).forEach(m => console.log("  Match:", m));

  const tbs = extractTextbookLinks(html);
  console.log("\nTextbook links found:", tbs.length);
  tbs.forEach(t => console.log(" -", t.slug, "|", t.id));

  // Check for chapter links directly on subject page
  const chs = extractChapterLinks(html);
  console.log("\nChapter links found:", chs.length);
  chs.slice(0, 5).forEach(c => console.log(" -", c.name, "|", c.id));

  // Also try direct subject page format
  const altUrl = "https://www.shaalaa.com/search-textbook-solutions/maharashtra-board-10th-standard-ssc-english-medium_1440";
  console.log("\n\nTrying alt URL:", altUrl);
  const html2 = await fetchPageHtml(altUrl);
  const tbs2 = extractTextbookLinks(html2);
  console.log("Direct page textbook links:", tbs2.length);
  tbs2.slice(0, 10).forEach(t => console.log(" -", t.slug, "|", t.id));

  const slugMatch = html2.match(/\/textbook-solutions\//gi);
  console.log("Raw /textbook-solutions/ occurrences:", slugMatch?.length || 0);

  // Show unique hrefs containing textbook-solutions
  const hrefMatches = [...new Set(html2.match(/href="[^"]*textbook-solutions[^"]*"/gi) || [])];
  console.log("\nUnique textbook-solutions hrefs:");
  hrefMatches.forEach(m => console.log("  ", m));

  await closeBrowser();
}

main().catch(console.error);
