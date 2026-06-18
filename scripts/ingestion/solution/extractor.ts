/**
 * Solution extractor — extracts step-by-step solutions from parsed HTML blocks.
 *
 * Detects step boundaries: numbered steps ("Step 1:", "1."), paragraph breaks after
 * equations, "Solution:" labels, and multi-step formatting.
 */
import * as cheerio from "cheerio";
import type { ContentBlock, SolutionStep } from "../types";
import { createBlock, parsePage } from "../parser/block-factory";
import { generateBlockId } from "../config/blocks";
import { cleanMathNotation } from "../equation";

const STEP_PATTERNS = [
  /^(step\s*\d+)\s*[:.]\s*/i,
  /^(\d+)\s*[.)]\s+/,
  /^(\(\w+\))\s+/,
  /^(→|⇒|∴)\s+/,
];

// Text markers that indicate the content past this point is not relevant solution content
const STOP_MARKERS = [
  /^report\s*(an?\s*)?error/i,
  /^appears\sin/i,
  /^chapter\s*\d+/i,
  /^(previous|next|prev)\b/i,
  /^balbharati\s/i,
  /^ncert\s/i,
  /^\d{4}-\d{4}\s*\(/i,   // Year patterns like "2018-2019 (March)"
  /^exercises\s*\|/i,
  /^q\s*\d+[\.)]/i,
  /^advertisement/i,
];

function isStopBlock(text: string): boolean {
  return STOP_MARKERS.some((p) => p.test(text.trim()));
}

/**
 * Extract solution steps from HTML string.
 */
export function extractSolution(html: string): SolutionStep[] {
  // Try QAPage JSON-LD first
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      const items = Array.isArray(ld) ? ld : [ld];

      for (const item of items) {
        if (item["@type"] === "QAPage" && item.mainEntity?.acceptedAnswer?.text) {
          const text = cleanMathNotation(item.mainEntity.acceptedAnswer.text);
          if (text.trim().length > 0) {
            return [{ stepNumber: 1, blocks: [{ type: "paragraph", id: generateBlockId(), content: text }] }];
          }
        }
      }
    } catch {}
  }

  // Try Shaalaa-specific .qbq_text_solution selector
  const solutionBlocks = extractFromShaalaaSelector(html);
  if (solutionBlocks.length > 0 && solutionBlocks.some((b) => (b.content || "").trim().length > 5)) {
    return buildSteps(solutionBlocks);
  }

  // Fallback: parse entire page and try to extract solution area
  const blocks = parsePage(html);
  const solutionAreaBlocks = extractSolutionBlocks(blocks);

  if (solutionAreaBlocks.length === 0) {
    return [{
      stepNumber: 1,
      blocks: blocks.length > 0 ? blocks.slice(0, 3) : [{ type: "paragraph", id: "s_fallback", content: "Solution not found" }],
    }];
  }

  return buildSteps(solutionAreaBlocks);
}

/**
 * Extract content from Shaalaa's .qbq_text_solution div.
 */
function extractFromShaalaaSelector(html: string): ContentBlock[] {
  const $ = cheerio.load(html);
  const $sol = $(".qbq_text_solution");
  if ($sol.length === 0) return [];

  const blocks: ContentBlock[] = [];
  $sol.find("p, li, h1, h2, h3, h4, h5, h6, div, table, img, span.qbq_span").each((_, el) => {
    const $el = $(el);
    const tag = (el.tagName || "").toLowerCase();
    const text = $el.text().trim();

    if (tag === "img") {
      const src = $el.attr("src") || "";
      if (src) {
        blocks.push({
          type: "image",
          id: generateBlockId(),
          content: $el.attr("alt") || "",
          attrs: { src },
        });
      }
      return;
    }

    if (text.length > 0 && !isStopBlock(text)) {
      blocks.push({
        type: "paragraph",
        id: generateBlockId(),
        content: cleanMathNotation(text),
      });
    }
  });

  // If no block-level elements found, get all text
  if (blocks.length === 0) {
    const text = cleanMathNotation($sol.text().trim());
    if (text.length > 0) {
      blocks.push({ type: "paragraph", id: generateBlockId(), content: text });
    }
  }

  return blocks;
}

/**
 * Filter blocks to only solution-relevant ones.
 */
function extractSolutionBlocks(blocks: ContentBlock[]): ContentBlock[] {
  let started = false;
  const result: ContentBlock[] = [];

  for (const block of blocks) {
    const text = block.content || "";

    // Detect solution start markers
    if (!started && /\b(solution|answer|soln)\s*[:.]?\s*/i.test(text)) {
      started = true;
      const trimmed = text.replace(/\b(solution|answer|soln)\s*[:.]?\s*/i, "").trim();
      if (trimmed && !isStopBlock(trimmed)) {
        result.push({ ...block, content: trimmed });
      }
      continue;
    }

    // Skip blocks before solution found
    if (!started) continue;

    // Stop at markers that indicate we've left the solution area
    if (isStopBlock(text)) break;

    result.push(block);
  }

  return result;
}

/**
 * Build SolutionStep array from flat blocks, detecting step boundaries.
 */
function buildSteps(blocks: ContentBlock[]): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let currentBlocks: ContentBlock[] = [];
  let stepNum = 1;

  for (const block of blocks) {
    const text = block.content || "";
    let isNewStep = false;
    let title: string | undefined;

    for (const pattern of STEP_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        isNewStep = true;
        title = match[1] || undefined;
        break;
      }
    }

    if (isNewStep && currentBlocks.length > 0) {
      steps.push({ stepNumber: stepNum++, blocks: currentBlocks });
      currentBlocks = [];
    }

    // If it's a new step and the block content is just the step marker, keep it as heading-like
    if (isNewStep) {
      const cleaned = text.replace(STEP_PATTERNS.find((p) => p.test(text))!, "").trim();
      if (cleaned) {
        currentBlocks.push({ ...block, content: cleaned });
      }
    } else {
      currentBlocks.push(block);
    }
  }

  // Don't forget the last group
  if (currentBlocks.length > 0) {
    steps.push({ stepNumber: stepNum++, blocks: currentBlocks });
  }

  // Clean empty steps
  return steps.filter((s) => s.blocks.length > 0 && s.blocks.some((b) => {
    const t = (b.content || "").trim();
    return t.length > 0;
  }));
}
