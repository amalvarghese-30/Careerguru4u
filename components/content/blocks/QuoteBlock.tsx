import type { ContentBlock } from "@/scripts/ingestion/types";
import { BlockRenderer } from "../BlockRenderer";
import { Quote } from "lucide-react";

interface QuoteBlockProps {
  block: ContentBlock;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <blockquote className="my-4 pl-4 border-l-4 border-brand-royal/30 italic text-neutral-darkGray">
      <div className="flex items-start gap-2">
        <Quote className="h-4 w-4 text-brand-royal/40 flex-shrink-0 mt-1" />
        <div>
          {block.content && <p className="text-sm md:text-base leading-relaxed">{block.content}</p>}
          {block.children && block.children.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      </div>
    </blockquote>
  );
}
