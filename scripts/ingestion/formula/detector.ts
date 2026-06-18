/**
 * Formula box detector — identifies highlighted/boxed formulas in content blocks
 * and reclassifies them as formula-box, example-box, etc.
 *
 * Detects:
 * - CSS classes: formula, important, highlight, box
 * - Common patterns: "Formula:", "Important:", "Note:", "Example:"
 * - Boxed content with borders/backgrounds
 */
import type { ContentBlock } from "../types";

const FORMULA_PATTERNS = [
  /^(formula|equation)\s*[:：]\s*/i,
  /^(example|ex)\s*[:：]\s*\d*/i,
  /^(important|note|warning|definition)\s*[:：]\s*/i,
];

/**
 * Walk the block tree and promote paragraphs that match formula/box patterns
 * into their proper block types.
 */
export function detectAndPromoteBoxes(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    // Recurse into children
    if (block.children) {
      block.children = detectAndPromoteBoxes(block.children);
    }

    // Only promote paragraphs that match known patterns
    if (block.type !== "paragraph" || !block.content) return block;

    for (const pattern of FORMULA_PATTERNS) {
      const match = block.content.match(pattern);
      if (match) {
        const prefix = match[1].toLowerCase();

        if (prefix === "formula" || prefix === "equation") {
          block.type = "formula-box";
        } else if (prefix === "example" || prefix === "ex") {
          block.type = "example-box";
        } else if (prefix === "important" || prefix === "note") {
          block.type = "important-box";
        } else if (prefix === "warning") {
          block.type = "warning-box";
        } else if (prefix === "definition") {
          block.type = "definition-box";
        }

        // Remove the prefix label from content
        block.content = block.content.replace(pattern, "").trim();
        break;
      }
    }

    return block;
  });
}

/**
 * Find blocks that are likely to contain formulas based on content patterns.
 * Returns block IDs that should be treated as formulas.
 */
export function findFormulaBlocks(blocks: ContentBlock[]): string[] {
  const ids: string[] = [];

  function walk(block: ContentBlock) {
    if (block.type === "equation" || block.type === "inline-math" || block.type === "formula-box") {
      ids.push(block.id);
    }

    if (block.content) {
      // Detect LaTeX patterns in text content
      const hasLatex =
        block.content.includes("\\frac") ||
        block.content.includes("\\sqrt") ||
        block.content.includes("\\sum") ||
        block.content.includes("\\int") ||
        /`[^`]+`/.test(block.content) ||
        /\$[^$]+\$/.test(block.content);

      if (hasLatex && block.type !== "formula-box") {
        block.type = "formula-box";
        ids.push(block.id);
      }
    }

    if (block.children) block.children.forEach(walk);
  }

  blocks.forEach(walk);
  return ids;
}
