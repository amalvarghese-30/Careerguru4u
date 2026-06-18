import type { ContentBlock } from "@/scripts/ingestion/types";

interface CodeBlockProps {
  block: ContentBlock;
}

export function CodeBlock({ block }: CodeBlockProps) {
  return (
    <pre className="my-3 p-4 rounded-xl bg-neutral-nearBlack text-green-400 text-sm font-mono leading-relaxed overflow-x-auto">
      <code>{block.content || ""}</code>
    </pre>
  );
}
