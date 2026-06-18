"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BlockEditCard } from "./BlockEditCard";
import { generateBlockId } from "@/scripts/ingestion/config/blocks";
import type { ContentBlock, BlockType } from "@/scripts/ingestion/types";

interface BlockListEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  label?: string;
}

const BLOCK_CATEGORIES: { name: string; types: BlockType[] }[] = [
  {
    name: "Text",
    types: ["paragraph", "heading", "quote", "superscript", "subscript", "horizontal-rule"],
  },
  {
    name: "Math",
    types: ["equation", "inline-math"],
  },
  {
    name: "Media",
    types: ["image", "svg", "figure", "caption", "video", "audio", "download-link"],
  },
  {
    name: "Structure",
    types: ["table", "ordered-list", "unordered-list"],
  },
  {
    name: "Callouts",
    types: ["formula-box", "example-box", "warning-box", "important-box", "definition-box"],
  },
  {
    name: "Reference",
    types: ["hyperlink", "reference", "code-block"],
  },
  {
    name: "Other",
    types: ["unknown"],
  },
];

const BLOCK_DEFAULTS: Record<BlockType, Partial<ContentBlock>> = {
  paragraph: { content: "" },
  heading: { content: "", attrs: { level: 2 } },
  equation: { content: "" },
  "inline-math": { content: "$x$" },
  table: { attrs: { headers: ["Col 1", "Col 2"], rows: [["", ""]] } },
  image: { attrs: { src: "", alt: "" }, content: "" },
  svg: { content: "" },
  "ordered-list": { children: [] },
  "unordered-list": { children: [] },
  "list-item": { content: "" },
  "formula-box": { content: "" },
  "example-box": { content: "" },
  "warning-box": { content: "" },
  "important-box": { content: "" },
  "definition-box": { content: "" },
  "code-block": { content: "" },
  quote: { content: "" },
  "horizontal-rule": {},
  figure: { content: "" },
  caption: { content: "" },
  superscript: { content: "" },
  subscript: { content: "" },
  hyperlink: { attrs: { href: "" }, content: "" },
  reference: { content: "" },
  video: { attrs: { src: "" }, content: "" },
  audio: { attrs: { src: "" }, content: "" },
  "download-link": { attrs: { href: "" }, content: "" },
  unknown: { content: "" },
};

export function BlockListEditor({ blocks, onChange, label = "Blocks" }: BlockListEditorProps) {
  const [showAdd, setShowAdd] = useState(false);

  function addBlock(type: BlockType) {
    const defaults = BLOCK_DEFAULTS[type];
    const newBlock: ContentBlock = {
      type,
      id: generateBlockId(),
      ...defaults,
    } as ContentBlock;
    onChange([...blocks, newBlock]);
    setShowAdd(false);
  }

  function updateBlock(index: number, block: ContentBlock) {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label} ({blocks.length})
        </span>
        <div className="relative">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-brand-royal font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </button>
          {showAdd && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAdd(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                {BLOCK_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      {cat.name}
                    </div>
                    {cat.types.map((type) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-brand-bg hover:text-brand-royal"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          No blocks yet. Click "Add Block" to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, i) => (
            <BlockEditCard
              key={block.id || i}
              block={block}
              onChange={(b) => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveUp(i)}
              onMoveDown={() => moveDown(i)}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
