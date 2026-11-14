"use client";

import * as React from "react";
import {
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  ColorStyleButton,
  CreateLinkButton,
  TextAlignButton,
  NestBlockButton,
  UnnestBlockButton,
  FormattingToolbarProps,
  useBlockNoteEditor,
} from "@blocknote/react";
import { AiRephraseToolbarButton } from "@/components/editor/AiRephraseToolbarButton";

interface CustomFormattingToolbarProps extends FormattingToolbarProps {
  editor?: any;
  onPostContentChanged?: () => void;
}

export function CustomFormattingToolbar({
  editor: propEditor,
  onPostContentChanged,
  ...props
}: CustomFormattingToolbarProps) {
  const contextEditor = useBlockNoteEditor();
  const editor = propEditor || contextEditor;

  return (
    <FormattingToolbar {...props}>
      <AiRephraseToolbarButton
        editor={editor}
        onPostContentChanged={onPostContentChanged}
      />
      <BlockTypeSelect key="blockTypeSelect" />
      <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
      <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
      <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
      <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
      <BasicTextStyleButton basicTextStyle="code" key="codeStyleButton" />
      <ColorStyleButton key="colorStyleButton" />
      <CreateLinkButton key="createLinkButton" />
      <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
      <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
      <TextAlignButton textAlignment="right" key="textAlignRightButton" />
      <NestBlockButton key="nestBlockButton" />
      <UnnestBlockButton key="unnestBlockButton" />
    </FormattingToolbar>
  );
}
