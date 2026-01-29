import { useCurrentEditor } from "@tiptap/react";
import { useRef } from "react";

export const useRichTextMenuBar = () => {
  const { editor } = useCurrentEditor();

  const hiddenColorInputRef = useRef<HTMLInputElement>(null);
  const hiddenHighlightInputRef = useRef<HTMLInputElement>(null);

  return {
    editor,
    hiddenHighlightInputRef,
    hiddenColorInputRef,
  };
};
