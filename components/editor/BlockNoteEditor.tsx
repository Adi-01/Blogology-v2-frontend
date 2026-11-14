"use client";

import * as React from "react";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  FormattingToolbarController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Sparkles } from "lucide-react";
import { CustomFormattingToolbar } from "@/components/editor/CustomFormattingToolbar";
import { InlineAiWriter } from "@/components/editor/InlineAiWriter";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// Exclude all media blocks (image, video, audio, file) so Cover Image is the sole image field
const { image, video, audio, file, ...allowedBlockSpecs } = defaultBlockSpecs;
const editorSchema = BlockNoteSchema.create({ blockSpecs: allowedBlockSpecs });

const editorTheme = {
  light: {
    colors: {
      editor: {
        text: "var(--foreground)",
        background: "transparent",
      },
    },
  },
  dark: {
    colors: {
      editor: {
        text: "var(--foreground)",
        background: "transparent",
      },
    },
  },
};

interface BlockNoteEditorProps {
  initialContent?: any;
  onChange?: (content: any) => void;
  onEditorReady?: (editor: any) => void;
  editable?: boolean;
}

export function BlockNoteEditor({
  initialContent,
  onChange,
  onEditorReady,
  editable = true,
}: BlockNoteEditorProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [inlineAiOpen, setInlineAiOpen] = React.useState(false);
  const [inlineAiTargetBlockId, setInlineAiTargetBlockId] = React.useState<string | null>(null);
  const [inlineAiWarning, setInlineAiWarning] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const editor = useCreateBlockNote({
    schema: editorSchema,
    initialContent:
      Array.isArray(initialContent) && initialContent.length > 0
        ? initialContent
        : undefined,
  });

  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  const handleTriggerAiWrite = React.useCallback(() => {
    if (!editor) return;

    const cursor = editor.getTextCursorPosition();
    const currentBlock = cursor?.block;
    const contentText = Array.isArray(currentBlock?.content)
      ? currentBlock.content.map((c: any) => c.text || "").join("")
      : String(currentBlock?.content || "");

    // If cursor is behind existing text, prompt the user to use a new line
    if (contentText.trim().length > 0) {
      setInlineAiWarning("Please place the cursor on a new line to write with AI.");
      setInlineAiTargetBlockId(currentBlock?.id || null);
      setInlineAiOpen(true);
      return;
    }

    setInlineAiWarning(null);
    setInlineAiTargetBlockId(currentBlock?.id || null);
    setInlineAiOpen(true);
  }, [editor]);

  return (
    <div className="w-full min-h-[450px] font-sans relative">
      {/* Inline AI Writer Prompt & Streamer */}
      <InlineAiWriter
        editor={editor}
        isOpen={inlineAiOpen}
        targetBlockId={inlineAiTargetBlockId}
        warningMessage={inlineAiWarning}
        onClose={() => {
          setInlineAiOpen(false);
          setInlineAiWarning(null);
        }}
        onPostContentChanged={() => {
          if (onChange && editor) {
            onChange(editor.document);
          }
        }}
      />

      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme === "dark" ? editorTheme.dark : editorTheme.light}
        slashMenu={false}
        formattingToolbar={false}
        className="focus:outline-none focus-visible:outline-none focus-within:outline-none border-0 outline-none bg-transparent"
        onChange={() => {
          if (onChange) {
            onChange(editor.document);
          }
        }}
      >
        {/* Custom floating selection formatting toolbar with Tone-based Rephrase */}
        <FormattingToolbarController
          formattingToolbar={CustomFormattingToolbar}
        />

        {/* Slash Command Menu with /ai-write */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => {
            const defaultItems = getDefaultReactSlashMenuItems(editor);
            const customAiItems = [
              {
                title: "AI Write",
                onItemClick: () => {
                  handleTriggerAiWrite();
                },
                aliases: ["ai-write", "ai", "write", "compose", "draft"],
                group: "AI Assistant",
                icon: <Sparkles className="w-4 h-4 text-foreground" />,
                subtext: "Draft new content with Blogology AI (/ai-write)",
              },
            ];
            return filterSuggestionItems([...customAiItems, ...defaultItems], query);
          }}
        />
      </BlockNoteView>
    </div>
  );
}
