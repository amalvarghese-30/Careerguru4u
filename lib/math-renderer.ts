import { decode } from "html-entities";

/**
 * Decodes all HTML entities in a string (e.g. &ndash; → −, &times; → ×)
 * Also handles numeric entities like &#x3C0; → π
 */
export function decodeEntities(text: string): string {
  return decode(text, { level: "html5" });
}

/**
 * Detects patterns that indicate a mathematical expression in plain text.
 * Used to decide whether to render a fragment with KaTeX.
 */
export function looksLikeMath(text: string): boolean {
  return /[\^²³⁴⁵⁶⁷⁸⁹⁰√∑∏∫∂∇∞±≤≥≠≈≡∠⊥°▶→←↑↓⇒⇐⇑⇓∴∵]|[a-z]\^[0-9]|\b(sin|cos|tan|cot|sec|csc|log|ln|lim|det|gcd|mod)\b/.test(text);
}

/**
 * Strips step labels from text to extract just the mathematical content.
 * e.g. "Step 1: x + y = 5" → { label: "Step 1", content: "x + y = 5" }
 */
export function parseStep(text: string): { label?: string; content: string } {
  const match = text.match(/^(Step\s*\d+)[:.\-–—\s]+(.*)$/i);
  if (match) {
    return { label: match[1].trim(), content: match[2].trim() };
  }
  return { content: text };
}

/**
 * Formats a solution answer by detecting and labeling steps.
 * Returns an array of sections, each being a step or plain text.
 */
export function formatSolutionSteps(rawAnswer: string): Array<{
  type: "heading" | "step" | "text" | "math" | "final-answer";
  content: string;
  stepNumber?: number;
}> {
  const decoded = decodeEntities(rawAnswer);
  const sections: Array<{
    type: "heading" | "step" | "text" | "math" | "final-answer";
    content: string;
    stepNumber?: number;
  }> = [];

  // Split by numbered steps: "Step 1", "Step 2", or bullet-style numbering like "1.", "2."
  const stepLines = decoded.split(/\n(?=(?:Step\s*\d+|(?:^|\n)\s*\d+[.)]\s))/gm);

  for (const line of stepLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const stepMatch = trimmed.match(/^(Step\s*(\d+))[:.\-–—\s]+(.*)$/i);
    if (stepMatch) {
      sections.push({
        type: "step",
        content: stepMatch[3].trim(),
        stepNumber: parseInt(stepMatch[2]),
      });
      continue;
    }

    // Check for answer/final markers
    if (/^(Therefore|Hence|Thus|So|The (answer|value|solution|required)|Final (Answer|Solution))/im.test(trimmed)) {
      sections.push({
        type: "final-answer",
        content: trimmed,
      });
      continue;
    }

    // Check for given/known/let markers
    if (/^(Given|Let|Assume|We know|Known)/im.test(trimmed)) {
      sections.push({
        type: "heading",
        content: trimmed,
      });
      continue;
    }

    sections.push({ type: "text", content: trimmed });
  }

  // If no steps were detected, treat the entire answer as a single text block
  if (sections.length === 0 && decoded.trim()) {
    sections.push({ type: "text", content: decoded.trim() });
  }

  return sections;
}
