import type { ContentBlock } from "@/scripts/ingestion/types";

interface ImageBlockProps {
  block: ContentBlock;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const src = (block.attrs?.src as string) || "";
  const alt = (block.attrs?.alt as string) || block.content || "";
  const width = block.attrs?.width ? Number(block.attrs.width) : undefined;
  const height = block.attrs?.height ? Number(block.attrs.height) : undefined;

  if (!src) return null;

  return (
    <figure className="my-4">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-xl max-w-full h-auto border border-neutral-lightGray"
        loading="lazy"
      />
      {alt && <figcaption className="text-xs text-neutral-darkGray/70 text-center mt-2">{alt}</figcaption>}
    </figure>
  );
}
