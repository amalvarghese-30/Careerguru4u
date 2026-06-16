/**
 * Shaalaa.com Solution Scraper
 *
 * Extracts textbook solutions from Shaalaa.com for all boards/subjects/classes.
 *
 * Usage:
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9 --subject=algebra
 *   node scripts/scrape-shaalaa.mjs --board=cbse --class=10 --subject=science
 *   node scripts/scrape-shaalaa.mjs --board=icse --class=9
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9  (all subjects)
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9 --dry  (discover only)
 *
 * Output: JSON files in ./scraped-data/{board}/{class}/{subject}/
 * Each file contains solutions ready for bulk import via /api/admin/solutions
 */

import fs from "fs";
import path from "path";

const BASE = "https://www.shaalaa.com";
const DELAY_MS = 1000; // 1s between requests
const OUTPUT_DIR = path.join(process.cwd(), "scraped-data");

// Known direct textbook IDs for classes/courses where discovery pages don't list board textbooks.
// Used as a fallback when course-subject page returns no board-specific books.
const KNOWN_TEXTBOOKS = {
  maharashtra: {
    10: [
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-10-maharashtra-state-board", id: "52" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-10-maharashtra-state-board", id: "50" },
      { slug: "balbharati-solutions-science-and-technology-part-1-english-standard-10-maharashtra-state-board", id: "51" },
      { slug: "balbharati-solutions-science-and-technology-2-english-standard-10-maharashtra-state-board", id: "53" },
    ],
    8: [
      { slug: "balbharati-solutions-mathematics-english-standard-8-maharashtra-state-board", id: "117" },
      { slug: "balbharati-solutions-science-english-8-standard-maharashtra-state-board", id: "116" },
    ],
  },
};

// ─── Course ID Database ───────────────────────────────────────────
const COURSE_IDS = {
  maharashtra: {
    1:   { id: 1442, slug: "maharashtra-state-board-1st-standard", medium: "english" },
    2:   { id: 1443, slug: "maharashtra-state-board-2nd-standard", medium: "english" },
    3:   { id: 1444, slug: "maharashtra-state-board-3rd-standard", medium: "english" },
    4:   { id: 1445, slug: "maharashtra-state-board-4th-standard", medium: "english" },
    5:   { id: 1435, slug: "maharashtra-board-5th-standard-ssc-english-medium", medium: "english" },
    6:   { id: 1436, slug: "maharashtra-board-6th-standard-ssc-english-medium", medium: "english" },
    7:   { id: 1437, slug: "maharashtra-board-7th-standard-ssc-english-medium", medium: "english" },
    8:   { id: 1438, slug: "maharashtra-board-8th-standard-ssc-english-medium", medium: "english" },
    9:   { id: 1439, slug: "maharashtra-board-9th-standard-ssc-english-medium", medium: "english" },
    10:  { id: 1440, slug: "maharashtra-board-10th-standard-ssc-english-medium", medium: "english" },
  },
  cbse: {
    1:   { id: 3001, slug: "cbse-class-1-english-medium", medium: "english" },
    2:   { id: 3002, slug: "cbse-class-2-english-medium", medium: "english" },
    3:   { id: 3003, slug: "cbse-class-3-english-medium", medium: "english" },
    4:   { id: 3004, slug: "cbse-class-4-english-medium", medium: "english" },
    5:   { id: 3005, slug: "cbse-class-5-english-medium", medium: "english" },
    6:   { id: 3006, slug: "cbse-class-6-english-medium", medium: "english" },
    7:   { id: 3007, slug: "cbse-class-7-english-medium", medium: "english" },
    8:   { id: 3008, slug: "cbse-class-8-english-medium", medium: "english" },
    9:   { id: 151,  slug: "cbse-secondary-school-examination-english-medium-class-9", medium: "english" },
    10:  { id: 152,  slug: "cbse-secondary-school-examination-english-medium-class-10", medium: "english" },
  },
  icse: {
    1:   { id: 3600, slug: "cisce-icse-class-1", medium: "english" },
    2:   { id: 3601, slug: "cisce-icse-class-2", medium: "english" },
    3:   { id: 3602, slug: "cisce-icse-class-3", medium: "english" },
    4:   { id: 3603, slug: "cisce-icse-class-4", medium: "english" },
    5:   { id: 3604, slug: "cisce-icse-class-5", medium: "english" },
    6:   { id: 39,   slug: "cisce-icse-class-6-indian-certificate-of-secondary-education", medium: "english" },
    7:   { id: 40,   slug: "cisce-icse-class-7-indian-certificate-of-secondary-education", medium: "english" },
    8:   { id: 41,   slug: "cisce-icse-class-8-indian-certificate-of-secondary-education", medium: "english" },
    9:   { id: 42,   slug: "cisce-icse-class-9-indian-certificate-of-secondary-education", medium: "english" },
    10:  { id: 661,  slug: "cisce-icse-class-10-indian-certificate-of-secondary-education", medium: "english" },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Board-specific textbook prefix filters
const BOARD_TEXTBOOK_FILTERS = {
  maharashtra: ["balbharati-solutions"],
  cbse: ["ncert-solutions"],
  icse: ["selina-solutions", "ml-aggarwal", "frank-solutions", "rd-sharma"],
};

function filterTextbooksByBoard(textbooks, boardKey, className) {
  const prefixes = BOARD_TEXTBOOK_FILTERS[boardKey];
  if (!prefixes) return textbooks;
  let filtered = textbooks.filter(tb => prefixes.some(p => tb.slug.startsWith(p)));

  // Also filter by class number (e.g. standard-8, 8th-standard, -8-)
  if (className != null) {
    const cls = String(className);
    const classPatterns = [
      `-standard-${cls}`,
      `-${cls}th-standard`,
      `-${cls}-`,
      `-class-${cls}`,
    ];
    filtered = filtered.filter(tb =>
      classPatterns.some(p => tb.slug.includes(p))
    );
  }

  return filtered;
}

async function fetchPage(url) {
  console.log(`  GET ${url}`);
  await delay(DELAY_MS);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/**
 * Extract IDs and slugs from Shaalaa search-textbook-solutions page.
 * Parses out subject links like: ?subjects=algebra-9th-mathematics-1_8870
 */
function parseSubjectLinks(html, courseUrl) {
  const subjects = [];
  // Pattern: href="/search-textbook-solutions/...?subjects=subject-name_id"
  const subjectRegex = /href="([^"]*\?subjects=([^"&]+)_(\d+))"/gi;
  let match;
  while ((match = subjectRegex.exec(html)) !== null) {
    const fullHref = match[1];
    const slug = match[2];
    const id = match[3];
    // Extract readable name from slug
    const name = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
    const url = fullHref.startsWith("http") ? fullHref : BASE + fullHref;
    if (!subjects.find(s => s.id === id)) {
      subjects.push({ name, slug, id, url });
    }
  }
  return subjects;
}

/**
 * Extract textbook solution links from a subject page.
 * Pattern: /textbook-solutions/{textbook-slug}_{textbook-id}
 */
function parseTextbookLinks(html) {
  const textbooks = [];
  const regex = /\/textbook-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    textbooks.push({
      url: BASE + `/textbook-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return textbooks;
}

/**
 * Extract chapter links from a textbook page.
 * Pattern: /textbook-solutions/c/{chapter-slug}_{chapter-id}
 */
function parseChapterLinks(html) {
  const chapters = [];
  const regex = /\/textbook-solutions\/c\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    let name = slug
      .replace(/^balbharati-solutions-|^ncert-solutions-|^selina-solutions-|^ml-aggarwal-|^rd-sharma-|^frank-solutions-/i, "")
      .replace(/-english-?(standard|medium)?-?\d*(?:st|nd|rd|th)?-?(standard)?-?(maharashtra-state-board)?-?(ssc)?-?(english-?medium)?.*$/, "")
      .replace(/^mathematics-\d-|^science-and-technology-|^history-and-political-science-|^geography-/, "")
      .replace(/^english-kumarbharati-|^hindi-lokbharati-|^hindi-composite-lokvani-|^marathi-aksharbharati-|^marathi-composite-antarbharati-|^sanskrit-amod-|^sanskrit-composite-anand-/, "")
      .replace(/^(chapter|ch|lesson)-\d+-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

    // If name is empty/too generic, try to extract from the link text in HTML
    if (!name || name.length < 5) {
      const linkRegex = new RegExp(`<a[^>]*href="[^"]*\\/c\\/${slug}_${id}"[^>]*>([\\s\\S]*?)<\\/a>`, "i");
      const linkMatch = html.match(linkRegex);
      if (linkMatch) {
        name = stripHtml(linkMatch[1]).trim();
      }
    }

    if (!name || name.length < 3) name = "Chapter " + chapters.length + 1;

    chapters.push({ name, slug, id, url: BASE + `/textbook-solutions/c/${slug}_${id}` });
  }
  return chapters;
}

/**
 * Extract question links and metadata from a chapter page.
 * Parses the question-bank-solutions links.
 */
function parseQuestionLinks(html, chapterUrl) {
  const questions = [];
  // Match question-bank-solutions URLs
  const regex = /\/question-bank-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    questions.push({
      url: BASE + `/question-bank-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return questions;
}

/**
 * Extract question text and answer text from a solution page.
 * Handles the backtick-delimited math notation used by Shaalaa.
 */
function parseSolution(html) {
  let question = "";
  let answer = "";

  // Extract from JSON-LD structured data (most reliable)
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      if (ld["@graph"]) {
        for (const item of ld["@graph"]) {
          if (item["@type"] === "Question" && item.name) {
            question = stripHtml(item.name).trim();
          }
          if (item["@type"] === "Answer" && item.text) {
            answer = stripHtml(item.text).trim();
          }
        }
      }
    } catch {}
  }

  // Fallback: H1 for question
  if (!question) {
    const h1Match = html.match(/<h1[^>]*class="[^"]*question-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
      || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      question = stripHtml(h1Match[1]).trim();
    }
  }

  // Fallback: meta description
  if (!question) {
    const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    if (metaMatch) question = stripHtml(metaMatch[1]).trim();
  }

  // Extract answer from solution content area
  if (!answer) {
    const solDiv = html.match(/class="[^"]*solution[_-]content[^"]*"[^>]*>([\s\S]*?)<\/div>/is)
      || html.match(/class="[^"]*answer[^"]*"[^>]*>([\s\S]*?)<\/div>/is)
      || html.match(/class="[^"]*solution[^"]*"[^>]*>([\s\S]*?)<\/div>/is);
    if (solDiv) {
      answer = stripHtml(solDiv[1]).trim();
    }
  }

  // Fallback: extract all text content after question, skipping nav/footer
  if (!answer) {
    // Remove scripts, styles, nav, header, footer
    let body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "");

    const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || body.match(/class="[^"]*main-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

    if (mainMatch) {
      const text = stripHtml(mainMatch[1]).trim();
      // Try to split after the question to get the answer
      if (question && text.includes(question)) {
        answer = text.substring(text.indexOf(question) + question.length).trim();
      } else {
        answer = text;
      }
    }
  }

  // Strip common prefixes
  question = question.replace(/^(Question\s*:?\s*|Q\s*:?\s*|Q\.\s*)/i, "").trim();
  answer = answer
    .replace(/^Solution\s*:?\s*/i, "")
    .replace(/^Show\s*Solution\s*/i, "")
    .replace(/^Answer\s*:?\s*/i, "")
    .replace(/^A\s*:?\s*/i, "")
    .replace(/^SolutionShow Solution\s*/i, "")
    .replace(/^Show Solution\s*/i, "")
    .trim();

  // Clean math notation
  question = cleanMathNotation(question);
  answer = cleanMathNotation(answer);

  return { question, answer };
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&minus;/g, "−")
    .replace(/&times;/g, "×")
    .replace(/&divide;/g, "÷")
    .replace(/&pi;/g, "π")
    .replace(/&radic;/g, "√")
    .replace(/&infin;/g, "∞")
    .replace(/&sum;/g, "∑")
    .replace(/&int;/g, "∫")
    .replace(/&theta;/g, "θ")
    .replace(/&alpha;/g, "α")
    .replace(/&beta;/g, "β")
    .replace(/&gamma;/g, "γ")
    .replace(/&delta;/g, "Δ")
    .replace(/&lambda;/g, "λ")
    .replace(/&mu;/g, "μ")
    .replace(/&le;/g, "≤")
    .replace(/&ge;/g, "≥")
    .replace(/&ne;/g, "≠")
    .replace(/&deg;/g, "°")
    .replace(/&perp;/g, "⟂")
    .replace(/&ang;/g, "∠")
    .replace(/&sim;/g, "∼")
    .replace(/&cong;/g, "≅")
    .replace(/&there4;/g, "∴")
    .replace(/&hellip;/g, "…")
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&harr;/g, "↔")
    .replace(/&#8201;/g, "")
    .replace(/&#8202;/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\\n/g, "\n")
    .trim();
}

/**
 * Clean Shaalaa's backtick-delimited math notation into readable text.
 * Input:  `\`13/5\`` (html-escaped)
 * Output: 13/5  (or formatted with proper math notation)
 *
 * The backtick format \`...\` wraps inline math expressions.
 * Also handles sqrt notation, bar notation for repeating decimals, etc.
 */
function cleanMathNotation(text) {
  if (!text) return "";

  // Strip figcaption/image alt text remnants
  text = text.replace(/Figure\s+\d+\.\d+/gi, "").trim();

  return text
    // Replace escaped backtick-wrapped math: \`content\` → proper notation
    .replace(/\\`([^`]+)\\`/g, (_, math) => formatMath(math))
    // Replace unescaped backtick-wrapped math
    .replace(/`([^`]+)`/g, (_, math) => formatMath(math))
    // Handle sqrt notation: sqrt(N) or sqrt(N)
    .replace(/sqrt\s*\(([^)]+)\)/gi, "√($1)")
    .replace(/sqrt\s*(\d+)/gi, "√$1")
    .replace(/sqrt/gi, "√")
    // Clean up multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Clean up excessive whitespace
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Format a LaTeX-style math expression into readable Unicode text.
 */
function formatMath(math) {
  // LaTeX \frac{a}{b}
  math = math.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");

  // Superscript with braces: x^{abc} → x^(abc), then convert numbers
  math = math.replace(/\^\{([^}]+)\}/g, (_, content) => {
    const superscripted = content.replace(/\d+/g, numToSuperscript)
                                  .replace(/\w/g, c => superscriptLetter(c));
    return superscripted;
  });

  // Simple superscript: x^2, x^3 etc (single term)
  math = math.replace(/\^(\d+)/g, (_, num) => numToSuperscript(num));
  math = math.replace(/\^(-?\w+)/g, (_, term) => superscriptLetter(term));

  // Subscript with braces: x_{abc}
  math = math.replace(/_\{([^}]+)\}/g, (_, content) => subscriptString(content));
  // Simple subscript: x_1, x_n (single term)
  math = math.replace(/_(\d+)/g, (_, num) => numToSubscript(num));
  math = math.replace(/_(\w)/g, (_, c) => subscriptChar(c));

  // Multiplication: xx → × (but preserve xx in hex context, pattern is digitxxdigit)
  math = math.replace(/(\d)xx(\d)/g, "$1×$2");
  math = math.replace(/\\times/g, "×");

  // Overline / bar notation for repeating decimals
  math = math.replace(/\\overline\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*(\d+)/g, "$1̅");
  math = math.replace(/bar\s*(\d+)/g, "$1̅");

  // Greek letters
  math = math.replace(/\\pi/g, "π"); math = math.replace(/\\theta/g, "θ");
  math = math.replace(/\\alpha/g, "α"); math = math.replace(/\\beta/g, "β");
  math = math.replace(/\\gamma/g, "γ"); math = math.replace(/\\delta/g, "Δ");
  math = math.replace(/\\lambda/g, "λ"); math = math.replace(/\\mu/g, "μ");
  math = math.replace(/\\sigma/g, "σ"); math = math.replace(/\\rho/g, "ρ");
  math = math.replace(/\\omega/g, "ω"); math = math.replace(/\\Omega/g, "Ω");

  // Other LaTeX
  math = math.replace(/\\infty/g, "∞"); math = math.replace(/\\sum/g, "∑");
  math = math.replace(/\\int/g, "∫"); math = math.replace(/\\prod/g, "∏");
  math = math.replace(/\\therefore/g, "∴"); math = math.replace(/\\because/g, "∵");
  math = math.replace(/\\pm/g, "±"); math = math.replace(/\\mp/g, "∓");
  math = math.replace(/\\div/g, "÷");
  math = math.replace(/\\leq/g, "≤"); math = math.replace(/\\geq/g, "≥");
  math = math.replace(/\\neq/g, "≠"); math = math.replace(/\\approx/g, "≈");
  math = math.replace(/\\angle/g, "∠"); math = math.replace(/\\triangle/g, "△");
  math = math.replace(/\\degree/g, "°"); math = math.replace(/\\sqrt/g, "√");
  math = math.replace(/\\cdot/g, "·"); math = math.replace(/\\to/g, "→");
  math = math.replace(/\\Rightarrow/g, "⇒"); math = math.replace(/\\Leftrightarrow/g, "⇔");
  math = math.replace(/\\perp/g, "⟂"); math = math.replace(/\\parallel/g, "∥");
  math = math.replace(/\\sim/g, "∼"); math = math.replace(/\\cong/g, "≅");
  math = math.replace(/\\subset/g, "⊂"); math = math.replace(/\\subseteq/g, "⊆");
  math = math.replace(/\\in/g, "∈"); math = math.replace(/\\notin/g, "∉");
  math = math.replace(/\\forall/g, "∀"); math = math.replace(/\\exists/g, "∃");
  math = math.replace(/\\cup/g, "∪"); math = math.replace(/\\cap/g, "∩");
  math = math.replace(/\\empty/g, "∅"); math = math.replace(/\\varnothing/g, "∅");

  return math;
}

function numToSuperscript(num) {
  const sups = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
  return String(num).split("").map(d => sups[d] || d).join("");
}

function numToSubscript(num) {
  const subs = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉"};
  return String(num).split("").map(d => subs[d] || d).join("");
}

function superscriptLetter(s) {
  const map = {"a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","i":"ⁱ","j":"ʲ","k":"ᵏ","l":"ˡ","m":"ᵐ","n":"ⁿ","o":"ᵒ","p":"ᵖ","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ","x":"ˣ","y":"ʸ","z":"ᶻ","-":"⁻","+":"⁺","(":"⁽",")":"⁾"};
  return s.split("").map(c => map[c] || c).join("");
}

function subscriptChar(c) {
  const subs = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","a":"ₐ","e":"ₑ","i":"ᵢ","o":"ₒ","u":"ᵤ","x":"ₓ","+":"₊","-":"₋"};
  return subs[c] || c;
}

function subscriptString(s) {
  return s.split("").map(c => subscriptChar(c)).join("");
}

// ─── Main Scraping Logic ─────────────────────────────────────────

async function scrapeChapter(chapterUrl, chapterName, boardName, className, subjectName) {
  console.log(`\n  📖 Chapter: ${chapterName}`);
  console.log(`     URL: ${chapterUrl}`);

  let html;
  try {
    html = await fetchPage(chapterUrl);
  } catch (err) {
    console.error(`     ❌ Failed to fetch chapter: ${err.message}`);
    return [];
  }

  // Extract proper chapter name from the page H1 or breadcrumb
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    let fromPage = stripHtml(h1Match[1])
      .replace(/^Balbharati\s*Solutions?\s*for\s*/i, "")
      .replace(/^NCERT\s*Solutions?\s*for\s*/i, "")
      .replace(/^Selina\s*Solutions?\s*for\s*/i, "")
      .replace(/Mathematics\s*\d+\s*\(?\[?English\]?\s*\)?\s*Standard\s*\d+\s*/gi, "")
      .replace(/\s*chapter\s*\d+\s*[-–—]\s*/gi, "")
      .replace(/\s*\[Latest\s*edition\]/gi, "")
      .replace(/\s*Class\s*\d+\s*/gi, "")
      .replace(/Maharashtra\s*State\s*Board/i, "")
      .trim();
    if (fromPage && fromPage.length > 3 && !fromPage.toLowerCase().startsWith("solutions")) {
      chapterName = fromPage;
    }
  }

  const questionLinks = parseQuestionLinks(html, chapterUrl);
  console.log(`     Found ${questionLinks.length} questions`);

  if (questionLinks.length === 0) return [];

  const solutions = [];
  for (let i = 0; i < questionLinks.length; i++) {
    const q = questionLinks[i];
    try {
      const qHtml = await fetchPage(q.url);
      const { question, answer } = parseSolution(qHtml);

      const solution = {
        question: question || `Question ${i + 1} from ${chapterName}`,
        answer: answer || "See solution on Shaalaa.com",
        board: boardName,
        class: className,
        subject: subjectName,
        chapter: chapterName,
        questionNumber: i + 1,
        isFree: true,
      };

      solutions.push(solution);

      if ((i + 1) % 10 === 0) {
        console.log(`     Progress: ${i + 1}/${questionLinks.length}`);
      }
    } catch (err) {
      console.error(`     ⚠ Failed question ${i + 1}: ${err.message}`);
    }
  }

  return solutions;
}

async function scrapeSubject(subjectInfo, boardName, className, boardKey) {
  console.log(`\n📘 Subject: ${subjectInfo.name}`);

  const course = COURSE_IDS[boardKey]?.[className];
  const courseSubjectUrl = course
    ? `${BASE}/search-textbook-solutions/${course.slug}_${course.id}?subjects=${subjectInfo.slug}_${subjectInfo.id}`
    : subjectInfo.url;

  // Fetch the course-specific subject page (filters to board-relevant textbooks)
  let html;
  try {
    html = await fetchPage(courseSubjectUrl);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
    return [];
  }

  // Find textbooks, filtered by board + class
  let textbooks = parseTextbookLinks(html);
  textbooks = filterTextbooksByBoard(textbooks, boardKey, className);
  console.log(`  Found ${textbooks.length} board-specific textbooks`);

  if (textbooks.length === 0) {
    // Try known textbook IDs as fallback (for e.g. Maharashtra Class 10 SSC that uses different URL patterns)
    const known = KNOWN_TEXTBOOKS[boardKey]?.[className];
    if (known) {
      // Filter known textbooks by subject name relevance
      const subjLower = subjectInfo.name.toLowerCase();
      let filtered = known;
      if (subjLower.includes("math") || subjLower.includes("mathematics")) {
        filtered = known.filter(t => t.slug.includes("mathematics"));
      } else if (subjLower.includes("physics") || subjLower.includes("chemistry")) {
        filtered = known.filter(t => t.slug.includes("science-and-technology-part-1") || t.slug.includes("science-and-technology-1"));
      } else if (subjLower.includes("biology")) {
        filtered = known.filter(t => t.slug.includes("science-and-technology-2"));
      } else if (subjLower.includes("science") || subjLower.includes("tech")) {
        filtered = known.filter(t =>
          t.slug.includes("science-and-technology") || t.slug.includes("-science-")
        );
      } else {
        filtered = [];
      }
      textbooks = filtered.map(t => ({
        url: `${BASE}/textbook-solutions/${t.slug}_${t.id}`,
        id: t.id,
        slug: t.slug,
      }));
      if (textbooks.length > 0) console.log(`  Using ${textbooks.length} known textbooks as fallback`);
    }
  }

  if (textbooks.length === 0) {
    // Try looking for chapter links directly
    const directChapters = parseChapterLinks(html);
    if (directChapters.length > 0) {
      console.log(`  Found ${directChapters.length} chapters directly`);
      let allSolutions = [];
      for (const ch of directChapters) {
        const solutions = await scrapeChapter(ch.url, ch.name, boardName, className, subjectInfo.name);
        allSolutions = allSolutions.concat(solutions);
      }
      return allSolutions;
    }
    return [];
  }

  // For each textbook, get chapters
  let allSolutions = [];
  for (const textbook of textbooks) {
    console.log(`\n  📚 Textbook: ${textbook.slug}`);

    let tbHtml;
    try {
      tbHtml = await fetchPage(textbook.url);
    } catch (err) {
      console.error(`    ❌ Failed: ${err.message}`);
      continue;
    }

    const chapters = parseChapterLinks(tbHtml);
    console.log(`    Found ${chapters.length} chapters`);

    for (const ch of chapters) {
      const solutions = await scrapeChapter(ch.url, ch.name, boardName, className, subjectInfo.name);
      allSolutions = allSolutions.concat(solutions);

      // Save incrementally after each chapter
      saveSolutions(allSolutions, boardKey, className, subjectInfo.slug);
    }
  }

  return allSolutions;
}

function saveSolutions(solutions, board, className, subjectSlug) {
  const dir = path.join(OUTPUT_DIR, board, String(className).padStart(2, "0"), subjectSlug);
  fs.mkdirSync(dir, { recursive: true });

  // Save full file
  const filePath = path.join(dir, "solutions.json");
  fs.writeFileSync(filePath, JSON.stringify(solutions, null, 2));

  // Split into chunks of 100 for easy bulk import
  const chunkSize = 100;
  for (let i = 0; i < solutions.length; i += chunkSize) {
    const chunk = solutions.slice(i, i + chunkSize);
    const chunkPath = path.join(dir, `solutions-chunk-${Math.floor(i / chunkSize) + 1}.json`);
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
  }

  console.log(`\n  💾 Saved ${solutions.length} solutions to ${dir}`);
}

function convertBoardName(boardKey) {
  const map = {
    maharashtra: "Maharashtra Board",
    cbse: "CBSE",
    icse: "ICSE",
  };
  return map[boardKey] || boardKey;
}

// ─── Discovery Mode ──────────────────────────────────────────────

async function discoverCourse(boardKey, className) {
  const course = COURSE_IDS[boardKey]?.[className];
  if (!course) {
    console.error(`Unknown course for ${boardKey} class ${className}`);
    return null;
  }

  const boardName = convertBoardName(boardKey);
  const courseUrl = `${BASE}/search-textbook-solutions/${course.slug}_${course.id}`;

  console.log(`\n🔍 Discovering ${boardName} Class ${className}`);
  console.log(`   URL: ${courseUrl}\n`);

  let html;
  try {
    html = await fetchPage(courseUrl);
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    return null;
  }

  const subjects = parseSubjectLinks(html, courseUrl);
  console.log(`\n📋 Found ${subjects.length} subjects:\n`);

  for (const s of subjects) {
    console.log(`   ${s.name}`);
    console.log(`     Slug: ${s.slug}  ID: ${s.id}`);
    console.log(`     URL: ${s.url}\n`);
  }

  // Save discovery data
  const dir = path.join(OUTPUT_DIR, boardKey, String(className).padStart(2, "0"));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "discovery.json"),
    JSON.stringify({ board: boardName, class: className, course, subjects }, null, 2)
  );

  console.log(`\n💾 Saved discovery data to ${dir}/discovery.json`);

  return subjects;
}

// ─── CLI ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1] : null;
  };

  const boardKey = getArg("board") || "maharashtra";
  const classStr = getArg("class") || "9";
  const subjectFilter = getArg("subject"); // optional - specific subject slug
  const dryRun = args.includes("--dry");
  const chapterOnly = getArg("chapter"); // optional - specific chapter

  const className = parseInt(classStr);

  if (!COURSE_IDS[boardKey]) {
    console.error(`Unknown board: ${boardKey}. Valid: ${Object.keys(COURSE_IDS).join(", ")}`);
    process.exit(1);
  }

  if (!COURSE_IDS[boardKey][className]) {
    console.error(`Unknown class ${className} for ${boardKey}. Valid classes: ${Object.keys(COURSE_IDS[boardKey]).join(", ")}`);
    process.exit(1);
  }

  console.log("═".repeat(60));
  console.log(`  Shaalaa Solution Scraper`);
  console.log(`  Board: ${convertBoardName(boardKey)} | Class: ${className}`);
  if (subjectFilter) console.log(`  Subject: ${subjectFilter}`);
  if (dryRun) console.log(`  Mode: DISCOVERY ONLY (--dry)`);
  console.log("═".repeat(60));

  // Step 1: Discover subjects
  const subjects = await discoverCourse(boardKey, className);

  if (dryRun || !subjects) {
    console.log("\n✅ Discovery complete. Run without --dry to scrape solutions.");
    return;
  }

  // Step 2: Filter subjects if specified
  let targets = subjects;
  if (subjectFilter) {
    targets = subjects.filter(s =>
      s.slug.includes(subjectFilter.toLowerCase()) ||
      s.name.toLowerCase().includes(subjectFilter.toLowerCase())
    );
    if (targets.length === 0) {
      console.error(`\n❌ Subject "${subjectFilter}" not found. Available subjects:`);
      subjects.forEach(s => console.log(`   ${s.name} (${s.slug})`));
      process.exit(1);
    }
  }

  const boardName = convertBoardName(boardKey);

  console.log(`\n🎯 Will scrape ${targets.length} subject(s):`);
  targets.forEach(s => console.log(`   - ${s.name}`));
  console.log(`\n⏱️  Estimated time: ~${targets.length * 5} minutes (${DELAY_MS / 1000}s delay between requests)\n`);

  // Step 3: Scrape each subject
  for (const subject of targets) {
    const solutions = await scrapeSubject(subject, boardName, className, boardKey);
    saveSolutions(solutions, boardKey, className, subject.slug);
  }

  console.log("\n" + "═".repeat(60));
  console.log("  Scraping Complete!");
  console.log(`  Data saved to: ${OUTPUT_DIR}`);
  console.log("═".repeat(60));
  console.log("\nTo import into the admin dashboard:");
  console.log("  1. Go to /admin/solutions");
  console.log("  2. Click 'Bulk Import'");
  console.log("  3. Paste the contents of a solutions-chunk-N.json file");
  console.log("  Or use the API directly:");
  console.log("  curl -X POST /api/admin/solutions -d @solutions-chunk-1.json");
}

main().catch(console.error);
