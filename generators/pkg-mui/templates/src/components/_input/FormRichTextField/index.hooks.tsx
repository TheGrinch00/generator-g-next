import { useCallback, useEffect, useRef } from "react";
import { Editor } from "@tiptap/core";
import { useFieldContext } from "@/components/_form";

export const useFormRichTextField = () => {
  const editorRef = useRef<Editor | null>(null);

  const field = useFieldContext<string>();

  const onContentChanged = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML();

      if (html === "<p></p>") {
        field.handleChange("");
      } else {
        field.handleChange(html);
      }
    },
    [field.handleChange],
  );

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.getHTML() !== field.state.value
    ) {
      editorRef.current.commands.setContent(field.state.value || "", false);
    }
  }, [field.state.value]);

  return { field, onContentChanged, editorRef };
};
