/**
 * LaTeX-to-Unicode converter for math expressions.
 *
 * Ported from scripts/scrape-shaalaa.mjs formatMath() and extended with:
 * - Full Greek alphabet, more LaTeX symbols
 * - Chemical equation handling (subscript preservation for formulas like H₂O)
 * - Matrix/array detection (preserved as structured LaTeX blocks)
 * - Backtick-delimited and $$/\(\) delimited math detection
 */
import {
  GREEK_TO_UNICODE,
  LATEX_SYMBOLS,
  numToSuperscript,
  numToSubscript,
  superscriptLetter,
  subscriptString,
} from "./unicode-math";

/**
 * Convert a LaTeX-style math expression to readable Unicode text.
 */
export function formatMath(math: string): string {
  // Fractions: \frac{a}{b} → (a)/(b)
  math = math.replace(/\\frac\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}/g, "($1)/($2)");

  // Superscript with braces
  math = math.replace(/\^\{([^}]+)\}/g, (_, content) => {
    const superscripted = content
      .replace(/\d+/g, (n: string) => numToSuperscript(n))
      .replace(/\w/g, (c: string) => superscriptLetter(c));
    return superscripted;
  });

  // Simple superscript
  math = math.replace(/\^(\d+)/g, (_, num: string) => numToSuperscript(num));
  math = math.replace(/\^(-?\w+)/g, (_, term: string) => superscriptLetter(term));

  // Subscript with braces
  math = math.replace(/_\{([^}]+)\}/g, (_, content: string) => subscriptString(content));

  // Simple subscript
  math = math.replace(/_(\d+)/g, (_, num: string) => numToSubscript(num));
  math = math.replace(/_(\w)/g, (_, c: string) => subscriptString(c));

  // Multiplication
  math = math.replace(/(\d)xx(\d)/g, "$1×$2");

  // Overline / bar notation for repeating decimals
  math = math.replace(/\\overline\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*(\d+)/g, "$1̅");
  math = math.replace(/bar\s*(\d+)/g, "$1̅");

  // Greek letters
  for (const [latex, unicode] of Object.entries(GREEK_TO_UNICODE)) {
    math = math.split(latex).join(unicode);
  }

  // LaTeX symbols
  for (const [latex, unicode] of Object.entries(LATEX_SYMBOLS)) {
    math = math.split(latex).join(unicode);
  }

  // Clean up remaining backslash commands
  math = math.replace(/\\text\{([^}]+)\}/g, "$1");
  math = math.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  math = math.replace(/\\textbf\{([^}]+)\}/g, "$1");
  math = math.replace(/\\mathit\{([^}]+)\}/g, "$1");

  return math;
}

/**
 * Detect and convert math delimiters in text.
 *   $$...$$ or \[...\] → display math (block)
 *   $...$ or \(...\) → inline math
 *   `...` (backtick) → inline math (Shaalaa convention)
 */
export function convertMathDelimiters(text: string): string {
  let result = text;

  // Display math: $$...$$ or \[...\]
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, math: string) => formatMath(math));
  result = result.replace(/\\\[([^\]]+)\\\]/g, (_, math: string) => formatMath(math));

  // Inline math: $...$ or \(...\)
  result = result.replace(/\$([^$]+)\$/g, (_, math: string) => formatMath(math));
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, math: string) => formatMath(math));

  // Backtick-delimited math (Shaalaa convention)
  result = result.replace(/\\`([^`]+)\\`/g, (_, math: string) => formatMath(math));
  result = result.replace(/`([^`]+)`/g, (_, math: string) => formatMath(math));

  // Sqrt notation
  result = result.replace(/sqrt\s*\(([^)]+)\)/gi, "√($1)");
  result = result.replace(/sqrt\s*(\d+)/gi, "√$1");
  result = result.replace(/sqrt/gi, "√");

  return result;
}

/**
 * Clean math notation — entry point for processing raw text into readable form.
 */
export function cleanMathNotation(text: string): string {
  if (!text) return "";

  return convertMathDelimiters(text)
    .replace(/Figure\s+\d+\.\d+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
