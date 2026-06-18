import type { ContentBlock } from "@/scripts/ingestion/types";

interface HeadingBlockProps {
  block: ContentBlock;
}

const sizeClasses: Record<number, string> = {
  1: "text-xl md:text-2xl font-bold",
  2: "text-lg md:text-xl font-semibold",
  3: "text-base md:text-lg font-semibold",
  4: "text-sm md:text-base font-medium",
  5: "text-sm font-medium",
  6: "text-xs font-medium uppercase tracking-wider",
};

export function HeadingBlock({ block }: HeadingBlockProps) {
  const level = Math.min(Math.max((block.attrs?.level as number) || 2, 1), 6);
  const cls = `${sizeClasses[level] || sizeClasses[2]} text-neutral-nearBlack mt-4 mb-2 first:mt-0`;
  const text = block.content || "";

  switch (level) {
    case 1: return <h1 className={cls}>{text}</h1>;
    case 2: return <h2 className={cls}>{text}</h2>;
    case 3: return <h3 className={cls}>{text}</h3>;
    case 4: return <h4 className={cls}>{text}</h4>;
    case 5: return <h5 className={cls}>{text}</h5>;
    default: return <h6 className={cls}>{text}</h6>;
  }
}
