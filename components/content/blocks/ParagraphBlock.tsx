import type { ContentBlock } from "@/scripts/ingestion/types";

interface ParagraphBlockProps {
  block: ContentBlock;
  className?: string;
}

export function ParagraphBlock({ block, className = "" }: ParagraphBlockProps) {
  return (
    <p className={`text-sm md:text-base text-neutral-darkGray leading-relaxed ${className}`}>
      {block.content || ""}
    </p>
  );
}
