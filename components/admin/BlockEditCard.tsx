"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff } from "lucide-react";
import type { ContentBlock, BlockType } from "@/scripts/ingestion/types";

interface BlockEditCardProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  equation: "Equation (display)",
  "inline-math": "Inline Math",
  table: "Table",
  image: "Image",
  svg: "SVG",
  "ordered-list": "Ordered List",
  "unordered-list": "Unordered List",
  "list-item": "List Item",
  "formula-box": "Formula Box",
  "example-box": "Example Box",
  "warning-box": "Warning Box",
  "important-box": "Important Box",
  "definition-box": "Definition Box",
  "code-block": "Code Block",
  quote: "Quote",
  "horizontal-rule": "Divider",
  figure: "Figure",
  caption: "Caption",
  superscript: "Superscript",
  subscript: "Subscript",
  hyperlink: "Hyperlink",
  reference: "Reference",
  video: "Video",
  audio: "Audio",
  "download-link": "Download Link",
  unknown: "Unknown (raw HTML)",
};

function update(block: ContentBlock, patch: Partial<ContentBlock>): ContentBlock {
  return { ...block, ...patch };
}

export function BlockEditCard({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: BlockEditCardProps) {
  const label = BLOCK_LABELS[block.type] || block.type;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-0.5">
          {onMoveUp && (
            <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30" title="Move up">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30" title="Move down">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={onDelete} className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50" title="Delete block">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {renderEditor(block, onChange)}
      </div>
    </div>
  );
}

function renderEditor(block: ContentBlock, onChange: (b: ContentBlock) => void) {
  switch (block.type) {
    case "paragraph":
    case "quote":
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={3}
          placeholder={block.type === "quote" ? "Quote text..." : "Paragraph text..."}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
        />
      );

    case "heading":
      return (
        <div className="flex gap-2">
          <select
            value={(block.attrs?.level as number) || 2}
            onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, level: parseInt(e.target.value) } }))}
            className="px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal w-20"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
            <option value={5}>H5</option>
            <option value={6}>H6</option>
          </select>
          <input
            type="text"
            value={block.content || ""}
            onChange={(e) => onChange(update(block, { content: e.target.value }))}
            placeholder="Heading text..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
        </div>
      );

    case "equation":
    case "inline-math":
      return <MathEditor block={block} onChange={onChange} />;

    case "image":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={(block.attrs?.src as string) || ""}
            onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, src: e.target.value } }))}
            placeholder="Image URL..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={(block.attrs?.alt as string) || block.content || ""}
              onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, alt: e.target.value }, content: e.target.value }))}
              placeholder="Alt text..."
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
            />
            <input
              type="number"
              value={(block.attrs?.width as number) || ""}
              onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, width: e.target.value ? parseInt(e.target.value) : undefined } }))}
              placeholder="Width"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
            />
            <input
              type="number"
              value={(block.attrs?.height as number) || ""}
              onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, height: e.target.value ? parseInt(e.target.value) : undefined } }))}
              placeholder="Height"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
            />
          </div>
          {(block.attrs?.src as string) && (
            <img src={block.attrs?.src as string} alt="" className="max-h-32 rounded-lg border border-slate-200" />
          )}
        </div>
      );

    case "table":
      return <TableEditor block={block} onChange={onChange} />;

    case "ordered-list":
    case "unordered-list":
      return <ListEditor block={block} onChange={onChange} />;

    case "list-item":
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={2}
          placeholder="List item text..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
        />
      );

    case "formula-box":
    case "example-box":
    case "warning-box":
    case "important-box":
    case "definition-box":
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={3}
          placeholder={`${BLOCK_LABELS[block.type]} content...`}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
        />
      );

    case "code-block":
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={4}
          placeholder="Code..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-royal resize-none bg-slate-900 text-green-400"
        />
      );

    case "hyperlink":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={(block.attrs?.href as string) || ""}
            onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, href: e.target.value } }))}
            placeholder="URL..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
          <input
            type="text"
            value={block.content || ""}
            onChange={(e) => onChange(update(block, { content: e.target.value }))}
            placeholder="Link text..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
        </div>
      );

    case "horizontal-rule":
      return (
        <div className="py-2">
          <hr className="border-slate-200" />
          <p className="text-xs text-slate-400 mt-1">Visual divider — no content needed</p>
        </div>
      );

    case "superscript":
    case "subscript":
    case "caption":
    case "reference":
      return (
        <input
          type="text"
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          placeholder={`${BLOCK_LABELS[block.type]} text...`}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
        />
      );

    case "svg":
    case "video":
    case "audio":
    case "download-link":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={(block.attrs?.src as string) || (block.attrs?.href as string) || block.content || ""}
            onChange={(e) => {
              if (block.type === "download-link") {
                onChange(update(block, { attrs: { ...block.attrs, href: e.target.value }, content: e.target.value }));
              } else {
                onChange(update(block, { attrs: { ...block.attrs, src: e.target.value }, content: e.target.value }));
              }
            }}
            placeholder={block.type === "download-link" ? "Download URL..." : "Media URL..."}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
        </div>
      );

    case "figure":
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={2}
          placeholder="Figure content..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
        />
      );

    case "unknown":
    default:
      return (
        <textarea
          value={block.content || ""}
          onChange={(e) => onChange(update(block, { content: e.target.value }))}
          rows={4}
          placeholder="Raw HTML or content..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-royal resize-none"
        />
      );
  }
}

function MathEditor({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const latex = block.content || "";

  useEffect(() => {
    if (!showPreview || !previewRef.current || !latex) return;
    import("katex").then((katex) => {
      if (!previewRef.current) return;
      try {
        katex.default.render(latex.replace(/^\$+|\$+$/g, "").trim(), previewRef.current, {
          throwOnError: false,
          displayMode: block.type === "equation",
          output: "html",
        });
      } catch {
        previewRef.current.textContent = latex;
      }
    }).catch(() => {
      if (previewRef.current) previewRef.current.textContent = latex;
    });
  }, [latex, showPreview, block.type]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">LaTeX</span>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 text-xs text-brand-royal hover:text-brand-navy"
        >
          {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPreview ? "Hide preview" : "Preview"}
        </button>
      </div>
      <textarea
        value={latex}
        onChange={(e) => onChange(update(block, { content: e.target.value }))}
        rows={3}
        placeholder={block.type === "equation" ? "\\frac{a}{b}" : "$x^2$"}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-royal resize-none"
      />
      {showPreview && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-[40px] flex items-center justify-center">
          <div ref={previewRef} />
        </div>
      )}
    </div>
  );
}

function TableEditor({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  const headers = (block.attrs?.headers as string[]) || [];
  const rows = (block.attrs?.rows as string[][]) || [];
  const caption = (block.attrs?.caption as string) || "";

  function updateCell(ri: number, ci: number, value: string) {
    const newRows = rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? value : c)) : r));
    onChange(update(block, { attrs: { ...block.attrs, rows: newRows } }));
  }

  function updateHeader(ci: number, value: string) {
    const newHeaders = [...headers];
    newHeaders[ci] = value;
    onChange(update(block, { attrs: { ...block.attrs, headers: newHeaders } }));
  }

  function addColumn() {
    const newHeaders = [...headers, ""];
    const newRows = rows.map((r) => [...r, ""]);
    onChange(update(block, { attrs: { ...block.attrs, headers: newHeaders, rows: newRows } }));
  }

  function removeColumn(ci: number) {
    const newHeaders = headers.filter((_, i) => i !== ci);
    const newRows = rows.map((r) => r.filter((_, i) => i !== ci));
    onChange(update(block, { attrs: { ...block.attrs, headers: newHeaders, rows: newRows } }));
  }

  function addRow() {
    const colCount = Math.max(headers.length, rows[0]?.length || 1);
    const newRows = [...rows, Array(colCount).fill("")];
    onChange(update(block, { attrs: { ...block.attrs, rows: newRows } }));
  }

  function removeRow(ri: number) {
    const newRows = rows.filter((_, i) => i !== ri);
    onChange(update(block, { attrs: { ...block.attrs, rows: newRows } }));
  }

  const colCount = Math.max(headers.length, rows[0]?.length || 0);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={caption}
        onChange={(e) => onChange(update(block, { attrs: { ...block.attrs, caption: e.target.value } }))}
        placeholder="Table caption (optional)..."
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci} className="p-1 border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => updateHeader(ci, e.target.value)}
                        placeholder={`Header ${ci + 1}`}
                        className="w-full px-1.5 py-1 rounded border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-royal"
                      />
                      {colCount > 1 && (
                        <button onClick={() => removeColumn(ci)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={`Cell ${ri + 1},${ci + 1}`}
                      className="w-full px-1.5 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:border-brand-royal"
                    />
                  </td>
                ))}
                <td className="p-1 border border-slate-200 w-8">
                  <button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={addColumn} className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
          + Column
        </button>
        <button onClick={addRow} className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
          + Row
        </button>
      </div>
    </div>
  );
}

function ListEditor({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  const children = block.children || [];

  function updateChild(index: number, child: ContentBlock) {
    const newChildren = [...children];
    newChildren[index] = child;
    onChange(update(block, { children: newChildren }));
  }

  function addChild() {
    onChange(update(block, {
      children: [...children, {
        type: "list-item",
        id: `item_${Date.now().toString(36)}`,
        content: "",
      }],
    }));
  }

  function removeChild(index: number) {
    onChange(update(block, { children: children.filter((_, i) => i !== index) }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {block.type === "ordered-list" ? "Ordered list items" : "Unordered list items"}
        </span>
        <button onClick={addChild} className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-brand-royal">
          + Item
        </button>
      </div>
      {children.map((child, i) => (
        <div key={child.id || i} className="flex items-start gap-2">
          <span className="text-xs text-slate-400 mt-2 w-6 text-right flex-shrink-0">
            {block.type === "ordered-list" ? `${i + 1}.` : "•"}
          </span>
          <input
            type="text"
            value={child.content || ""}
            onChange={(e) => updateChild(i, update(child, { content: e.target.value }))}
            placeholder={`Item ${i + 1}...`}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
          <button onClick={() => removeChild(i)} className="p-1.5 mt-1 text-red-400 hover:text-red-600 flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {children.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-3">No items. Click "+ Item" to add.</p>
      )}
    </div>
  );
}
