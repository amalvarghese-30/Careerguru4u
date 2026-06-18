import { AlertTriangle, Lightbulb, Star, Info, BookOpen, AlertCircle } from "lucide-react";
import type { ContentBlock } from "@/scripts/ingestion/types";
import { BlockRenderer } from "../BlockRenderer";

interface CalloutBlockProps {
  block: ContentBlock;
}

const variants: Record<string, { icon: typeof Lightbulb; bg: string; border: string; text: string; label: string }> = {
  "formula-box": {
    icon: Star,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    label: "Formula",
  },
  "example-box": {
    icon: BookOpen,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    label: "Example",
  },
  "warning-box": {
    icon: AlertTriangle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    label: "Warning",
  },
  "important-box": {
    icon: AlertCircle,
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
    label: "Important",
  },
  "definition-box": {
    icon: Info,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    label: "Definition",
  },
};

export function CalloutBlock({ block }: CalloutBlockProps) {
  const variant = variants[block.type] || variants["important-box"];
  const Icon = variant.icon;

  return (
    <div className={`my-4 rounded-xl ${variant.bg} border ${variant.border} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className={`text-xs font-semibold uppercase tracking-wider ${variant.text}`}>
          {variant.label}
        </span>
      </div>
      {block.content && (
        <p className={`text-sm md:text-base ${variant.text} leading-relaxed`}>
          {block.content}
        </p>
      )}
      {block.children && (
        <div className={`space-y-1 ${variant.text}`}>
          {block.children.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      )}
    </div>
  );
}
