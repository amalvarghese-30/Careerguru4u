/**
 * Normalizer — cleans scraped text and blocks.
 *
 * Handles:
 * - Unicode NFKC normalization
 * - HTML entity decoding (comprehensive)
 * - UTF-8 mojibake repair (common encoding artifacts)
 * - Whitespace normalization
 * - Quote/dash/bullet normalization
 * - Math artifact cleanup
 */
import type { ContentBlock } from "../types";

/**
 * Decode all common HTML entities to Unicode.
 */
export function decodeEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&#160;": " ",
    "&#8201;": "",
    "&#8202;": "",
    "&minus;": "−",
    "&times;": "×",
    "&divide;": "÷",
    "&pi;": "π",
    "&radic;": "√",
    "&infin;": "∞",
    "&sum;": "∑",
    "&int;": "∫",
    "&theta;": "θ",
    "&alpha;": "α",
    "&beta;": "β",
    "&gamma;": "γ",
    "&delta;": "Δ",
    "&lambda;": "λ",
    "&mu;": "μ",
    "&le;": "≤",
    "&ge;": "≥",
    "&ne;": "≠",
    "&deg;": "°",
    "&perp;": "⟂",
    "&ang;": "∠",
    "&sim;": "∼",
    "&cong;": "≅",
    "&there4;": "∴",
    "&hellip;": "…",
    "&rarr;": "→",
    "&larr;": "←",
    "&harr;": "↔",
    "&mdash;": "—",
    "&ndash;": "–",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": "“",
    "&rdquo;": "”",
    "&bull;": "•",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&euro;": "€",
    "&pound;": "£",
    "&yen;": "¥",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }

  // Numeric entities: &#NNNN; or &#xHHHH;
  result = result.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));

  return result;
}

/**
 * Fix common UTF-8 mojibake patterns caused by double-encoding.
 *
 * Portuguese characters (often in CBSE/ICSE content):
 *   mojibake sequences repaired to their correct Unicode characters
 *
 * Common symbols:
 *   bullet, en-dash, em-dash, quotes, ellipsis
 */
export function fixMojibake(text: string): string {
  let result = text;

  // Portuguese/Latin accented characters (from UTF-8 bytes interpreted as Latin-1)
  const latinFixes: Record<string, string> = {
    "Ã¡": "á", "Ã©": "é", "Ã­": "í",
    "Ã³": "ó", "Ãº": "ú",
    "Ã ": "à", "Ã¨": "è", "Ã¬": "ì",
    "Ã²": "ò", "Ã¹": "ù",
    "Ã£": "ã", "Ãµ": "õ", "Ã±": "ñ",
    "Ã§": "ç",
    "Ã¢": "â", "Ãª": "ê", "Ã®": "î",
    "Ã´": "ô", "Ã»": "û",
    "Ã¤": "ä", "Ã«": "ë", "Ã¯": "ï",
    "Ã¶": "ö", "Ã¼": "ü",
  };

  for (const [bad, good] of Object.entries(latinFixes)) {
    result = result.split(bad).join(good);
  }

  // Symbol mojibake (three-byte UTF-8 sequences)
  result = result.replace(/â€¢/g, "•");  // bullet
  result = result.replace(/â€"/g, "–");       // en-dash
  result = result.replace(/â€˜/g, "'");       // left single quote
  result = result.replace(/â€™/g, "'");       // right single quote
  result = result.replace(/â€œ/g, "“");  // left double quote
  result = result.replace(/â€/g, "”");  // right double quote
  result = result.replace(/â€¦/g, "…");  // ellipsis

  return result;
}

/**
 * Normalize whitespace — collapse multiple newlines/spaces, trim.
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Normalize quotes, dashes, and other typographic characters.
 */
export function normalizeTypographic(text: string): string {
  return text
    .replace(/[‘’‚‛′‵]/g, "'")
    .replace(/[“”„‟″‶]/g, '"')
    .replace(/[–—]/g, "–")
    .replace(/[…]/g, "…")
    .replace(/[ ]/g, " ");
}

/**
 * Full text normalization pipeline.
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  let result = text;
  result = decodeEntities(result);
  result = fixMojibake(result);
  result = normalizeTypographic(result);
  result = normalizeWhitespace(result);

  return result;
}

/**
 * Normalize all text content in a block tree recursively.
 */
export function normalizeBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.content) {
      block.content = normalizeText(block.content);
    }
    if (block.children) {
      block.children = normalizeBlocks(block.children);
    }
    return block;
  });
}

/**
 * Normalize Unicode using NFKC where available.
 */
export function normalizeUnicode(text: string): string {
  if (typeof text.normalize === "function") {
    return text.normalize("NFKC");
  }
  return text;
}
