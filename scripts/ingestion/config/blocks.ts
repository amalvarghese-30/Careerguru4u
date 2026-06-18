/**
 * Block type metadata — display names, default rendering hints, and
 * validation rules for every supported content block type.
 */
import { BlockType } from "../types";

export const BLOCK_META: Record<BlockType, { label: string; inline: boolean; container: boolean }> = {
  paragraph:      { label: "Paragraph",       inline: false, container: false },
  heading:        { label: "Heading",         inline: false, container: false },
  equation:       { label: "Equation",        inline: false, container: false },
  "inline-math":  { label: "Inline Math",     inline: true,  container: false },
  table:          { label: "Table",           inline: false, container: true  },
  image:          { label: "Image",           inline: false, container: false },
  svg:            { label: "SVG",             inline: false, container: false },
  "ordered-list":  { label: "Ordered List",    inline: false, container: true  },
  "unordered-list":{ label: "Unordered List",  inline: false, container: true  },
  "list-item":    { label: "List Item",       inline: false, container: true  },
  "formula-box":  { label: "Formula Box",     inline: false, container: true  },
  "example-box":  { label: "Example Box",     inline: false, container: true  },
  "warning-box":  { label: "Warning Box",     inline: false, container: true  },
  "important-box":{ label: "Important Box",   inline: false, container: true  },
  "definition-box":{ label: "Definition Box", inline: false, container: true  },
  "code-block":   { label: "Code Block",      inline: false, container: false },
  quote:          { label: "Quote",           inline: false, container: true  },
  "horizontal-rule":{ label: "Divider",       inline: false, container: false },
  figure:         { label: "Figure",          inline: false, container: true  },
  caption:        { label: "Caption",         inline: false, container: false },
  superscript:    { label: "Superscript",     inline: true,  container: false },
  subscript:      { label: "Subscript",       inline: true,  container: false },
  hyperlink:      { label: "Hyperlink",       inline: true,  container: false },
  reference:      { label: "Reference",       inline: false, container: false },
  video:          { label: "Video",           inline: false, container: false },
  audio:          { label: "Audio",           inline: false, container: false },
  "download-link":{ label: "Download Link",   inline: true,  container: false },
  unknown:        { label: "Unknown",         inline: false, container: true  },
};

/**
 * Shaalaa-specific CSS class → block type mappings.
 * When a DOM node matches one of these class patterns, we assign the
 * corresponding block type instead of the default element mapping.
 */
export const CLASS_TO_BLOCK: Array<{ pattern: RegExp; type: BlockType }> = [
  { pattern: /\bformula\b/i,         type: "formula-box" },
  { pattern: /\bexample\b/i,         type: "example-box" },
  { pattern: /\bwarning\b/i,         type: "warning-box" },
  { pattern: /\bimportant\b/i,       type: "important-box" },
  { pattern: /\bdefinition\b/i,      type: "definition-box" },
  { pattern: /\bnote\b/i,            type: "important-box" },
  { pattern: /\bhighlight\b/i,       type: "important-box" },
  { pattern: /\bqbq_text_solution\b/i, type: "paragraph" },
  { pattern: /\bqbq_text_question\b/i, type: "paragraph" },
  { pattern: /\bmath\b/i,            type: "equation" },
  { pattern: /\bequation\b/i,        type: "equation" },
  { pattern: /\bcode\b/i,            type: "code-block" },
  { pattern: /\bpre\b/i,             type: "code-block" },
  { pattern: /\bblockquote\b/i,      type: "quote" },
  { pattern: /\bfigure\b/i,          type: "figure" },
  { pattern: /\bcaption\b/i,         type: "caption" },
];

/**
 * HTML tag → default block type. Applied when no CLASS_TO_BLOCK rule matches.
 */
export const TAG_TO_BLOCK: Record<string, BlockType> = {
  p: "paragraph",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  img: "image",
  svg: "svg",
  table: "table",
  ul: "unordered-list",
  ol: "ordered-list",
  li: "list-item",
  blockquote: "quote",
  pre: "code-block",
  code: "code-block",
  sup: "superscript",
  sub: "subscript",
  a: "hyperlink",
  hr: "horizontal-rule",
  figure: "figure",
  figcaption: "caption",
  video: "video",
  audio: "audio",
  math: "equation",
};

let blockIdCounter = 0;

export function generateBlockId(): string {
  return `blk_${(++blockIdCounter).toString(36)}_${Date.now().toString(36)}`;
}
