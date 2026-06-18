/**
 * Question extractor — extracts structured questions from parsed page blocks.
 *
 * Handles:
 * - QAPage JSON-LD extraction (Shaalaa primary format)
 * - H1-based extraction (fallback)
 * - Question type detection (MCQ, short, long, diagram, numerical, derivation)
 * - Multi-part question detection (3(a)(ii), Q4(b), etc.)
 */
import * as cheerio from "cheerio";
import type { ContentBlock, ImageRef, TableRef, EquationRef } from "../types";
import { createBlock, parsePage } from "../parser/block-factory";
import { generateBlockId } from "../config/blocks";
import { cleanMathNotation } from "../equation";

/**
 * Extract question blocks from a solution page HTML string.
 * Returns the question as structured blocks.
 */
export function extractQuestion(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Primary: QAPage JSON-LD
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      const items = Array.isArray(ld) ? ld : [ld];

      for (const item of items) {
        if (item["@type"] === "QAPage" && item.mainEntity) {
          const q = item.mainEntity;
          if (q["@type"] === "Question" && q.name) {
            const text = cleanMathNotation(q.name);
            if (text.trim().length > 0) {
              return [{ type: "paragraph", id: generateBlockId(), content: text }];
            }
          }
        }

        // @graph format (older pages)
        if (item["@graph"]) {
          for (const node of item["@graph"]) {
            if (node["@type"] === "Question" && node.name) {
              const text = cleanMathNotation(node.name);
              if (text.trim().length > 0) {
                return [{ type: "paragraph", id: generateBlockId(), content: text }];
              }
            }
          }
        }
      }
    } catch {}
  }

  // Try Shaalaa-specific .qbq_text_question selector
  const $ = cheerio.load(html);
  const $qDiv = $(".qbq_text_question");
  if ($qDiv.length > 0) {
    const text = cleanMathNotation($qDiv.text().trim());
    if (text.length > 0) {
      return [{ type: "paragraph", id: generateBlockId(), content: text }];
    }
  }

  // Fallback: H1 tag
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const text = cleanMathNotation(h1Match[1].replace(/<[^>]+>/g, ""));
    if (text.trim().length > 0) {
      return [{ type: "paragraph", id: generateBlockId(), content: text }];
    }
  }

  return blocks;
}

/**
 * Detect the question type based on content patterns.
 */
export function detectQuestionType(blocks: ContentBlock[]): string {
  const fullText = blocks.map((b) => b.content || "").join(" ").toLowerCase();

  if (/\b(mcq|multiple choice|choose the correct|select the correct|tick|which of the following|a\s*\.|b\s*\.|c\s*\.|d\s*\.)\b/i.test(fullText)) {
    return "mcq";
  }

  if (/\b(diagram|draw|sketch|figure|illustrate|label)\b/i.test(fullText)) {
    return "diagram";
  }

  if (/\b(calculate|compute|solve|find|evaluate|determine|numerical|value)\b/i.test(fullText)) {
    return "numerical";
  }

  if (/\b(derive|prove|show that|hence|therefore|differentiate|integrate)\b/i.test(fullText)) {
    return "derivation";
  }

  // Length-based heuristic
  const totalLength = fullText.length;
  if (totalLength < 80) return "short";
  if (totalLength > 500) return "long";

  return "short";
}

/**
 * Detect difficulty level based on keywords.
 */
export function detectDifficulty(blocks: ContentBlock[]): string {
  const fullText = blocks.map((b) => b.content || "").join(" ").toLowerCase();

  if (/\b(prove|derive|hence|therefore|complex|difficult|advanced|critical)\b/i.test(fullText)) {
    return "hard";
  }

  if (/\b(explain|describe|define|state|list|name|what is|basic|simple|easy)\b/i.test(fullText)) {
    return "easy";
  }

  return "medium";
}

/**
 * Extract question number from URL slug or page content.
 */
export function extractQuestionNumber(url: string): string {
  // Try URL patterns: .../question-bank-solutions/...-q_3-a_ii_12345
  const numMatch = url.match(/-q_([^_]+(?:_[^_]+)*)_(\d+)$/);
  if (numMatch) return numMatch[1].replace(/_/g, "");

  // Fallback: last numeric ID
  const idMatch = url.match(/_(\d+)$/);
  if (idMatch) return idMatch[1];

  return "";
}
