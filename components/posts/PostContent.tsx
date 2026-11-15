"use client";

import dynamic from "next/dynamic";

const BlockNoteEditor = dynamic(
  () =>
    import("@/components/editor/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-48 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Loading story content…
      </div>
    ),
  },
);

interface PostContentProps {
  content: any;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="w-full">
      <BlockNoteEditor initialContent={content} editable={false} />
    </div>
  );
}
