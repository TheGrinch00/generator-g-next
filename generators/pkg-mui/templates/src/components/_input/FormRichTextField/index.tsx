import { Box, FormLabel } from "@mui/material";

// Editor components and tipTapExtensions
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import TTListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";

import { useFormRichTextField } from "./index.hooks";
import { RichTextMenuBar } from "./RichTextMenuBar";
import { FieldErrors } from "@/components/_form/FieldErrors";

export const tipTapExtensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Color.configure({ types: [TextStyle.name, TTListItem.name] }),
  Highlight.configure({
    multicolor: true,
  }),
  Underline.configure({}),
  TextStyle.configure({}),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "right", "center"],
  }),
  Text.configure({}),
  BulletList,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "tiptap-link",
    },
  }),
  Image.configure({
    inline: true,
    HTMLAttributes: {
      class: "tiptap-image",
    },
  }),
];

type FormRichTextFieldProps = {
  label?: string;
};

export const FormRichTextField = ({ label }: FormRichTextFieldProps) => {
  const { field, onContentChanged, editorRef } = useFormRichTextField();

  return (
    <Box>
      {label && <FormLabel>{label}</FormLabel>}
      <Box
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "5px",
          "& ol, ul": {
            p: "0 1rem",
          },
          "& a": {
            color: "blue",
            textDecoration: "underline",
          },
          "& .ProseMirror": {
            p: "1rem",
          },
          "& .tiptap-link": {
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
          },
        }}
      >
        <EditorProvider
          extensions={tipTapExtensions}
          content={field.state.value}
          onUpdate={onContentChanged}
          slotBefore={<RichTextMenuBar />}
          onCreate={({ editor }) => {
            editorRef.current = editor;
          }}
        >
          <div />
        </EditorProvider>
      </Box>
      <FieldErrors meta={field.state.meta} />
    </Box>
  );
};

FormRichTextField.displayName = "FormRichTextField";
