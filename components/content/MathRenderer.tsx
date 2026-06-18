"use client";

import { useEffect, useRef } from "react";

interface MathRendererProps {
  text: string;
  displayMode?: boolean;
  className?: string;
}

export function MathRenderer({ text, displayMode = false, className = "" }: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import("katex").then((katex) => {
      if (!containerRef.current) return;
      try {
        const mathPattern = /\$([^$]+)\$/g;
        const parts: Array<{ type: "text" | "math"; content: string }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = mathPattern.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
          }
          parts.push({ type: "math", content: match[1] });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
          parts.push({ type: "text", content: text.slice(lastIndex) });
        }

        if (parts.length === 0) {
          containerRef.current.textContent = text;
          return;
        }

        containerRef.current.innerHTML = "";
        for (const part of parts) {
          if (part.type === "math") {
            const span = document.createElement("span");
            katex.default.render(part.content.trim(), span, {
              throwOnError: false,
              displayMode,
              output: "html",
            });
            containerRef.current.appendChild(span);
          } else {
            const span = document.createElement("span");
            span.textContent = part.content;
            containerRef.current.appendChild(span);
          }
        }
      } catch {
        containerRef.current.textContent = text;
      }
    }).catch(() => {
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    });
  }, [text, displayMode]);

  return <span ref={containerRef} className={className || "math-content"} />;
}
