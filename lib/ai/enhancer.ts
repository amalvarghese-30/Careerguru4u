import { getClient } from "./client";
import { generateBlockId } from "@/scripts/ingestion/config/blocks";
import { BLOCK_TYPES } from "@/scripts/ingestion/types";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

export interface EnhancedResult {
  question: ContentBlock[];
  solution: SolutionStep[];
  questionType?: string;
  difficulty?: string;
  hints?: ContentBlock[];
}

const SYSTEM_PROMPT = `You are an expert educational content editor. Your job is to restructure textbook solutions into clear, step-by-step explanations suitable for students.

You work with a structured block system. Every piece of content is a typed block. Available block types:
- paragraph: plain text
- heading: section heading with attrs.level (1-6)
- equation: display math in LaTeX (e.g. \\frac{a}{b})
- inline-math: inline LaTeX (e.g. $x^2$)
- ordered-list: numbered list with children of type list-item
- unordered-list: bulleted list with children of type list-item
- list-item: a single list item (content string)
- formula-box: highlighted formula/result
- example-box: worked example
- warning-box: common mistake warning
- important-box: key point to remember
- definition-box: term definition
- code-block: code snippet
- quote: quoted text
- horizontal-rule: visual divider (no content needed)
- image: image with attrs: { src, alt, width?, height? }
- table: table with attrs: { headers: string[], rows: string[][], caption? }
- hyperlink: link with attrs: { href } and content as link text
- figure, caption, superscript, subscript, reference, svg, video, audio, download-link, unknown

ContentBlock format: { type, id, content?, children?: ContentBlock[], attrs?: Record<string, unknown> }
SolutionStep format: { stepNumber: number, title?: string, blocks: ContentBlock[] }

You output valid JSON matching this schema:
{
  "question": ContentBlock[],
  "solution": SolutionStep[],
  "questionType": "mcq" | "short" | "long" | "diagram" | "numerical" | "derivation",
  "difficulty": "easy" | "medium" | "hard",
  "hints"?: ContentBlock[]
}

Rules:
1. Break solutions into numbered steps (stepNumber starting at 1). Each step should have a short title.
2. Use callout boxes (formula-box, important-box, warning-box, example-box, definition-box) where they aid learning.
3. Wrap math in equation (display) or inline-math blocks with proper LaTeX.
4. Classify questionType and difficulty based on content analysis.
5. Generate 1-3 hints if the solution would benefit from them (hints should be paragraph blocks nudging the student toward the answer without revealing it).
6. Preserve the original question blocks — restructure only if they are poorly organized.
7. Generate unique IDs for NEW blocks using the pattern "ai_<short_random>". Keep existing IDs on preserved blocks.
8. Return ONLY valid JSON, no markdown wrapping, no code fences.`;

export async function enhanceSolution(
  question: ContentBlock[],
  solution: SolutionStep[]
): Promise<EnhancedResult> {
  const anthropic = getClient();

  const input = JSON.stringify({ question, solution }, null, 2);

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Restructure this solution into clear, step-by-step format. Classify the question type and difficulty. Generate hints if helpful.\n\n${input}`,
      },
    ],
  });

  const textBlock = msg.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  const rawText = textBlock.text.trim();
  const jsonText = rawText.replace(/^```json\s*|\s*```$/g, "").trim();

  let parsed: EnhancedResult;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse AI response as JSON. Raw: ${rawText.slice(0, 300)}`);
  }

  // Validate and sanitize the result
  const result: EnhancedResult = {
    question: validateBlocks(parsed.question, "question"),
    solution: validateSteps(parsed.solution),
    questionType: validateQuestionType(parsed.questionType),
    difficulty: validateDifficulty(parsed.difficulty),
    hints: parsed.hints ? validateBlocks(parsed.hints, "hints") : undefined,
  };

  return result;
}

function validateBlocks(blocks: unknown, context: string): ContentBlock[] {
  if (!Array.isArray(blocks)) {
    throw new Error(`${context}: expected array of ContentBlocks`);
  }
  return blocks.map((block, i) => validateBlock(block, `${context}[${i}]`));
}

function validateBlock(block: unknown, path: string): ContentBlock {
  if (!block || typeof block !== "object") {
    throw new Error(`${path}: expected object`);
  }
  const b = block as Record<string, unknown>;

  const type = b.type as string;
  if (!type || !BLOCK_TYPES.includes(type as typeof BLOCK_TYPES[number])) {
    throw new Error(`${path}: invalid or missing block type "${type}"`);
  }

  const result: ContentBlock = {
    type: type as ContentBlock["type"],
    id: (b.id as string) || generateBlockId(),
  };

  if (typeof b.content === "string") result.content = b.content;
  if (b.attrs && typeof b.attrs === "object") result.attrs = b.attrs as Record<string, unknown>;
  if (Array.isArray(b.children)) {
    result.children = b.children.map((child, i) => validateBlock(child, `${path}.children[${i}]`));
  }

  return result;
}

function validateSteps(steps: unknown): SolutionStep[] {
  if (!Array.isArray(steps)) {
    throw new Error("solution: expected array of SolutionSteps");
  }
  return steps.map((step, i) => {
    if (!step || typeof step !== "object") {
      throw new Error(`solution[${i}]: expected object`);
    }
    const s = step as Record<string, unknown>;
    return {
      stepNumber: (s.stepNumber as number) || i + 1,
      title: typeof s.title === "string" ? s.title : undefined,
      blocks: validateBlocks(s.blocks, `solution[${i}].blocks`),
    };
  });
}

function validateQuestionType(t: unknown): string | undefined {
  if (typeof t !== "string") return undefined;
  const valid = ["mcq", "short", "long", "diagram", "numerical", "derivation"];
  return valid.includes(t) ? t : undefined;
}

function validateDifficulty(d: unknown): string | undefined {
  if (typeof d !== "string") return undefined;
  const valid = ["easy", "medium", "hard"];
  return valid.includes(d) ? d : undefined;
}
