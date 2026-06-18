import type { ContentBlock } from "@/scripts/ingestion/types";

interface HyperlinkBlockProps {
  block: ContentBlock;
}

export function HyperlinkBlock({ block }: HyperlinkBlockProps) {
  const href = (block.attrs?.href as string) || "#";
  const text = block.content || href;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-royal hover:text-brand-navy underline underline-offset-2 transition-colors"
    >
      {text}
    </a>
  );
}
