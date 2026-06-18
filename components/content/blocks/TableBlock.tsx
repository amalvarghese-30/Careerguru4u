"use client";

import type { ContentBlock } from "@/scripts/ingestion/types";
import { MathRenderer } from "../MathRenderer";

interface TableBlockProps {
  block: ContentBlock;
}

export function TableBlock({ block }: TableBlockProps) {
  const headers = (block.attrs?.headers as string[]) || [];
  const rows = (block.attrs?.rows as string[][]) || [];
  const caption = (block.attrs?.caption as string) || "";

  // Fallback: extract from children
  if ((rows.length === 0 || headers.length === 0) && block.children) {
    const extractedRows: string[][] = [];
    for (const child of block.children) {
      if (child.type === "list-item" && child.children) {
        const cells = child.children
          .filter((c) => c.type === "paragraph" || c.type === "heading")
          .map((c) => c.content || "");
        if (cells.length > 0) extractedRows.push(cells);
      }
    }

    if (extractedRows.length > 0 && headers.length === 0) {
      return (
        <div className="my-4 overflow-x-auto rounded-xl border border-neutral-lightGray">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-offWhite">
                {extractedRows[0].map((cell, i) => (
                  <th key={i} className="px-4 py-2 text-left font-semibold text-neutral-nearBlack">
                    <MathRenderer text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {extractedRows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-t border-neutral-lightGray/50 even:bg-neutral-offWhite/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-neutral-darkGray">
                      <MathRenderer text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {caption && <p className="text-xs text-neutral-darkGray/70 text-center py-2">{caption}</p>}
        </div>
      );
    }
  }

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-neutral-lightGray">
      {caption && (
        <div className="px-4 py-2 bg-brand-bg/30 border-b border-neutral-lightGray">
          <p className="text-sm font-semibold text-neutral-nearBlack">{caption}</p>
        </div>
      )}
      <table className="w-full text-sm">
        {headers.length > 0 && (
          <thead>
            <tr className="bg-neutral-offWhite">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2 text-left font-semibold text-neutral-nearBlack">
                  <MathRenderer text={h} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-neutral-lightGray/50 even:bg-neutral-offWhite/30">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 text-neutral-darkGray">
                  <MathRenderer text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
