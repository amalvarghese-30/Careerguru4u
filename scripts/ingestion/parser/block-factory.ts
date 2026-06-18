/**
 * Block factory — creates typed ContentBlock objects from DOM nodes.
 */
import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { generateBlockId, CLASS_TO_BLOCK, TAG_TO_BLOCK } from "../config/blocks";
import type { BlockType, ContentBlock } from "../types";

type CheerioEl = cheerio.Cheerio<AnyNode>;

function mapToBlockType($el: CheerioEl): BlockType {
  const tag = (($el.prop("tagName") || "") as string).toLowerCase();
  const cls = (($el.attr("class") || "") as string).toLowerCase();

  for (const { pattern, type } of CLASS_TO_BLOCK) {
    if (pattern.test(cls)) return type;
  }

  if (TAG_TO_BLOCK[tag]) return TAG_TO_BLOCK[tag];

  return "unknown";
}

function extractAttrs($el: CheerioEl): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  const el = $el[0];
  if (!el || !("attribs" in el)) return attrs;

  const attribs = (el as Element).attribs;
  for (const [key, value] of Object.entries(attribs)) {
    if (key === "class" || key === "id") continue;
    attrs[key] = value;
  }
  return attrs;
}

/**
 * Create a ContentBlock from a cheerio element.
 * Recursively processes children for container blocks.
 */
export function createBlock(
  $el: CheerioEl,
  $: cheerio.CheerioAPI
): ContentBlock {
  const type = mapToBlockType($el);
  const block: ContentBlock = {
    type,
    id: generateBlockId(),
  };

  // Extract text content (only for leaf elements — container blocks use children)
  const isContainer = type === "ordered-list" || type === "unordered-list" ||
    type === "table" || type === "formula-box" || type === "example-box" ||
    type === "warning-box" || type === "important-box" || type === "definition-box" ||
    type === "quote" || type === "figure";

  if (!isContainer) {
    // For inline elements, preserve the inner HTML as content
    if (type === "inline-math" || type === "equation" || type === "code-block") {
      block.content = $el.html() || $el.text() || "";
    } else if (type === "image") {
      block.attrs = {
        src: $el.attr("src") || "",
        alt: $el.attr("alt") || "",
        width: $el.attr("width") || undefined,
        height: $el.attr("height") || undefined,
      };
      block.content = $el.attr("alt") || "";
    } else if (type === "heading") {
      const tag = ($el.prop("tagName") || "h2").toLowerCase();
      const level = parseInt(tag.replace("h", ""), 10) || 2;
      block.attrs = { level };
      block.content = $el.text().trim();
    } else if (type === "hyperlink") {
      block.attrs = { href: $el.attr("href") || "" };
      block.content = $el.text().trim();
    } else {
      block.content = $el.text().trim();
    }
  } else {
    block.attrs = extractAttrs($el);
    // Process children for container blocks
    const children = $el.children().toArray();
    if (children.length > 0) {
      block.children = children
        .map((child) => createBlock($(child) as CheerioEl, $))
        .filter((b) => {
          // Filter out empty paragraphs and whitespace-only blocks
          if (b.type === "paragraph" && (!b.content || b.content.trim() === "")) {
            return false;
          }
          return true;
        });
    }
  }

  return block;
}

/**
 * Parse a full HTML page into a flat array of top-level ContentBlocks.
 */
export function parsePage(html: string): ContentBlock[] {
  const $ = cheerio.load(html);
  const body = $("body");

  // Try to find the main content area
  const mainSelectors = [
    "main",
    ".main-content",
    "#content",
    ".content-area",
    ".qbq_text_solution",
  ];

  let $container: CheerioEl = body;
  for (const sel of mainSelectors) {
    const $el = $(sel);
    if ($el.length > 0) {
      $container = $el.first() as CheerioEl;
      break;
    }
  }

  const blocks: ContentBlock[] = [];
  $container.children().each((_, el) => {
    const $el = $(el) as CheerioEl;
    const tag = ($el.prop("tagName") || "").toLowerCase();

    // Skip script, style, nav, header, footer
    if (["script", "style", "nav", "header", "footer"].includes(tag)) return;

    const block = createBlock($el, $);

    // Only skip truly empty blocks
    const isEmpty = !block.content && (!block.children || block.children.length === 0);
    if (!isEmpty) {
      blocks.push(block);
    }
  });

  return blocks;
}
