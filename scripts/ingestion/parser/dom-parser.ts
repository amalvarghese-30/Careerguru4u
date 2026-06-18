/**
 * DOM Parser — converts raw HTML into structured blocks, images, tables, and equations.
 *
 * Uses cheerio for DOM traversal and delegates typed block creation to block-factory.
 */
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { parsePage, createBlock } from "./block-factory";
import { generateBlockId } from "../config/blocks";
import type { ParsedPage, ContentBlock, ImageRef, TableRef, EquationRef } from "../types";

/**
 * Parse an HTML page into a structured ParsedPage with blocks and asset references.
 */
export function parseHtmlPage(html: string, url: string): ParsedPage {
  const $ = cheerio.load(html);
  const blocks = parsePage(html);
  const images = extractImageRefs($, blocks);
  const tables = extractTableRefs($, blocks);
  const equations = extractEquationRefs(blocks);
  const parseErrors: string[] = [];

  if (blocks.length === 0 && html.length > 200) {
    parseErrors.push("No content blocks extracted from non-empty HTML");
  }

  const title = $("title").text().trim() || $("h1").first().text().trim() || "";

  return {
    url,
    title,
    blocks,
    images,
    tables,
    equations,
    rawHtml: html,
    parseErrors,
  };
}

/**
 * Extract ImageRef objects from parsed blocks (recursively).
 * Also scans cheerio DOM for any images not captured as blocks.
 */
function extractImageRefs($: cheerio.CheerioAPI, blocks: ContentBlock[]): ImageRef[] {
  const refs: ImageRef[] = [];
  const seen = new Set<string>();

  function walk(block: ContentBlock) {
    if (block.type === "image" && block.attrs) {
      const src = (block.attrs.src as string) || "";
      if (src && !seen.has(src)) {
        seen.add(src);
        refs.push({
          blockId: block.id,
          url: src,
          localPath: "",
          alt: (block.attrs.alt as string) || block.content || "",
          width: block.attrs.width ? Number(block.attrs.width) : undefined,
          height: block.attrs.height ? Number(block.attrs.height) : undefined,
          mimeType: guessMimeType(src),
        });
      }
    }
    if (block.children) {
      block.children.forEach(walk);
    }
  }

  blocks.forEach(walk);
  return refs;
}

/**
 * Extract TableRef objects from parsed blocks.
 */
function extractTableRefs($: cheerio.CheerioAPI, blocks: ContentBlock[]): TableRef[] {
  const refs: TableRef[] = [];

  function walk(block: ContentBlock) {
    if (block.type === "table" && block.children) {
      const headers: string[] = [];
      const rows: string[][] = [];

      for (const child of block.children) {
        if (child.type === "list-item" && child.children) {
          // Table row — check for header cells vs regular cells
          const cells = child.children
            .filter((c) => c.type === "paragraph")
            .map((c) => c.content || "");
          rows.push(cells);

          // First row → headers
          if (headers.length === 0 && cells.length > 0) {
            headers.push(...cells);
            rows.pop(); // Don't duplicate header row
          }
        }
      }

      // Fallback: try extracting from block's raw HTML content
      if (rows.length === 0 && block.content) {
        const $raw = cheerio.load(block.content);
        $raw("tr").each((_ri, tr) => {
          const cells: string[] = [];
          $raw(tr).find("td, th").each((_ci, cell) => {
            cells.push($raw(cell).text().trim());
          });
          if (cells.length > 0) rows.push(cells);
        });
        if (rows.length > 0 && headers.length === 0) {
          headers.push(...rows.shift()!);
        }
      }

      if (rows.length === 0) {
        refs.push({
          blockId: block.id,
          headers: [],
          rows: [],
          colCount: 0,
          rowCount: 0,
        });
        return;
      }

      refs.push({
        blockId: block.id,
        headers,
        rows,
        caption: block.attrs?.caption as string | undefined,
        colCount: headers.length || (rows[0]?.length ?? 0),
        rowCount: rows.length,
      });
    }
    if (block.children) {
      block.children.forEach(walk);
    }
  }

  blocks.forEach(walk);
  return refs;
}

/**
 * Extract EquationRef objects from parsed blocks.
 */
function extractEquationRefs(blocks: ContentBlock[]): EquationRef[] {
  const refs: EquationRef[] = [];

  function walk(block: ContentBlock) {
    if (block.type === "equation" || block.type === "inline-math") {
      refs.push({
        blockId: block.id,
        latex: block.attrs?.latex as string || block.content || "",
        unicode: block.content || "",
        isDisplay: block.type === "equation",
      });
    }
    if (block.children) {
      block.children.forEach(walk);
    }
  }

  blocks.forEach(walk);
  return refs;
}

/**
 * Parse a solution page — extracts QAPage JSON-LD into blocks.
 */
export function parseSolutionPage(html: string): { question: ContentBlock[]; answer: ContentBlock[] } {
  const $ = cheerio.load(html);
  const questionBlocks: ContentBlock[] = [];
  const answerBlocks: ContentBlock[] = [];

  // Extract from JSON-LD QAPage
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      const items = Array.isArray(ld) ? ld : [ld];

      for (const item of items) {
        if (item["@type"] === "QAPage" && item.mainEntity) {
          const q = item.mainEntity;
          if (q["@type"] === "Question" && q.name) {
            questionBlocks.push({
              type: "paragraph",
              id: generateBlockId(),
              content: q.name,
            });
          }
          if (q.acceptedAnswer?.text) {
            answerBlocks.push({
              type: "paragraph",
              id: generateBlockId(),
              content: q.acceptedAnswer.text,
            });
          }
        }
      }
    } catch {}
  }

  // Fallback: parse solution divs
  if (answerBlocks.length === 0) {
    const $sol = $(".qbq_text_solution");
    if ($sol.length > 0) {
      $sol.children().each((_, el) => {
        const block = createBlock($(el) as cheerio.Cheerio<AnyNode>, $);
        if (block.content || (block.children && block.children.length > 0)) {
          answerBlocks.push(block);
        }
      });
    }
  }

  return { question: questionBlocks, answer: answerBlocks };
}

function guessMimeType(src: string): string {
  const ext = src.split(".").pop()?.split("?")[0]?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
  };
  return map[ext || ""] || "image/png";
}
