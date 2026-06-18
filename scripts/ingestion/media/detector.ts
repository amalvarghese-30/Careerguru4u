/**
 * Image/SVG detector — finds media references in parsed HTML blocks.
 */
import type { ContentBlock, ImageRef } from "../types";

/**
 * Walk block tree and collect all image references.
 */
export function detectImages(blocks: ContentBlock[]): ImageRef[] {
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

    // Also check content for <img> tags (images inside raw HTML in unknown blocks)
    if (block.type === "unknown" && block.content) {
      const imgRegex = /<img[^>]+src="([^"]+)"/gi;
      let match: RegExpExecArray | null;
      while ((match = imgRegex.exec(block.content)) !== null) {
        const src = match[1];
        if (!seen.has(src)) {
          seen.add(src);
          refs.push({
            blockId: block.id,
            url: src,
            localPath: "",
            alt: "",
            mimeType: guessMimeType(src),
          });
        }
      }
    }

    if (block.children) block.children.forEach(walk);
  }

  blocks.forEach(walk);
  return refs;
}

/**
 * Walk block tree and collect all SVG references.
 */
export function detectSvgs(blocks: ContentBlock[]): ImageRef[] {
  const refs: ImageRef[] = [];
  const seen = new Set<string>();

  function walk(block: ContentBlock) {
    if (block.type === "svg") {
      const src = block.attrs?.src as string || "";
      if (src && !seen.has(src)) {
        seen.add(src);
        refs.push({
          blockId: block.id,
          url: src,
          localPath: "",
          alt: block.content || "",
          mimeType: "image/svg+xml",
        });
      }
    }
    if (block.children) block.children.forEach(walk);
  }

  blocks.forEach(walk);
  return refs;
}

function guessMimeType(src: string): string {
  const ext = src.split(".").pop()?.split("?")[0]?.toLowerCase() || "";
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  return map[ext] || "image/png";
}
