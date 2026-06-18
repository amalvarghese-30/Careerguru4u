"use client";

import { useEffect, useRef } from "react";
import type { ContentBlock } from "@/scripts/ingestion/types";

interface EquationBlockProps {
  block: ContentBlock;
}

export function EquationBlock({ block }: EquationBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const latex = (block.attrs?.latex as string) || block.content || "";
  const isDisplay = block.type === "equation";

  useEffect(() => {
    if (!containerRef.current || !latex) return;

    import("katex").then((katex) => {
      if (!containerRef.current) return;
      try {
        katex.default.render(latex.replace(/^\$+|\$+$/g, "").trim(), containerRef.current, {
          throwOnError: false,
          displayMode: isDisplay,
          output: "html",
        });
      } catch {
        containerRef.current.textContent = latex;
      }
    }).catch(() => {
      if (containerRef.current) {
        containerRef.current.textContent = latex;
      }
    });
  }, [latex, isDisplay]);

  if (!latex) return null;

  if (isDisplay) {
    return (
      <div className="my-4 py-3 px-4 rounded-xl bg-brand-bg/50 border border-brand-royal/10 overflow-x-auto">
        <div ref={containerRef} className="flex justify-center" />
      </div>
    );
  }

  return <span ref={containerRef} className="inline-block align-middle mx-0.5" />;
}
