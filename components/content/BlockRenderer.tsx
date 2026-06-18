import type { ContentBlock } from "@/scripts/ingestion/types";
import { MathRenderer } from "./MathRenderer";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { EquationBlock } from "./blocks/EquationBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ListBlock } from "./blocks/ListBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { HyperlinkBlock } from "./blocks/HyperlinkBlock";

interface BlockRendererProps {
  block: ContentBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} className="math-content" />;

    case "heading":
      return <HeadingBlock block={block} />;

    case "equation":
    case "inline-math":
      return <EquationBlock block={block} />;

    case "table":
      return <TableBlock block={block} />;

    case "image":
      return <ImageBlock block={block} />;

    case "ordered-list":
    case "unordered-list":
      return <ListBlock block={block} />;

    case "list-item":
      return <ParagraphBlock block={block} className="ml-4 math-content" />;

    case "formula-box":
    case "example-box":
    case "warning-box":
    case "important-box":
    case "definition-box":
      return <CalloutBlock block={block} />;

    case "code-block":
      return <CodeBlock block={block} />;

    case "quote":
      return <QuoteBlock block={block} />;

    case "hyperlink":
      return <HyperlinkBlock block={block} />;

    case "horizontal-rule":
      return <hr className="my-4 border-neutral-lightGray" />;

    case "superscript": {
      const supContent = block.content || "";
      return <sup className="text-xs">{supContent}</sup>;
    }

    case "subscript": {
      const subContent = block.content || "";
      return <sub className="text-xs">{subContent}</sub>;
    }

    case "caption":
    case "figure":
      return <ParagraphBlock block={block} className="text-xs text-neutral-darkGray/70 text-center" />;

    case "svg":
      return (
        <div
          className="my-2"
          dangerouslySetInnerHTML={{
            __html: (block.content || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/>/gi, ""),
          }}
        />
      );

    case "reference":
      return (
        <span className="text-xs text-brand-royal bg-brand-bg px-1.5 py-0.5 rounded">
          [{block.content || "ref"}]
        </span>
      );

    case "download-link": {
      const dlHref = (block.attrs?.href as string) || "#";
      const dlText = block.content || "Download";
      return (
        <a
          href={dlHref}
          className="inline-flex items-center gap-1 text-sm text-brand-royal hover:text-brand-navy underline underline-offset-2"
          download
        >
          {dlText}
        </a>
      );
    }

    case "video":
    case "audio":
      return (
        <div className="my-2 p-3 rounded-xl bg-neutral-offWhite border border-neutral-lightGray text-sm text-neutral-darkGray">
          [{block.type}] {block.content || "Media content"}
        </div>
      );

    case "unknown":
    default:
      if (block.content) {
        return (
          <div className="my-1 text-sm text-neutral-darkGray leading-relaxed">
            <MathRenderer text={block.content} />
          </div>
        );
      }
      if (block.children && block.children.length > 0) {
        return (
          <div>
            {block.children.map((child) => (
              <BlockRenderer key={child.id} block={child} />
            ))}
          </div>
        );
      }
      return null;
  }
}
