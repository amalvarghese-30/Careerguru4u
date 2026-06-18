import type { ContentBlock } from "@/scripts/ingestion/types";
import { BlockRenderer } from "../BlockRenderer";

interface ListBlockProps {
  block: ContentBlock;
}

export function ListBlock({ block }: ListBlockProps) {
  const Tag = block.type === "ordered-list" ? "ol" : "ul";
  const listStyle = block.type === "ordered-list"
    ? "list-decimal"
    : "list-disc";

  if (!block.children || block.children.length === 0) return null;

  return (
    <Tag className={`${listStyle} pl-5 space-y-0.5 my-2 text-sm md:text-base text-neutral-darkGray`}>
      {block.children.map((child) => (
        <li key={child.id} className="pl-1">
          <BlockRenderer block={child} />
        </li>
      ))}
    </Tag>
  );
}
