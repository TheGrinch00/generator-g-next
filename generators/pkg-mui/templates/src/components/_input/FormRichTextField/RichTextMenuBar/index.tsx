import React, { memo } from "react";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Theme,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import HighlightIcon from "@mui/icons-material/Highlight";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { useRichTextMenuBar } from "./index.hooks";

type RichTextMenuBarProps = {};

export const RichTextMenuBar = memo(({}: RichTextMenuBarProps) => {
  const { editor, hiddenHighlightInputRef, hiddenColorInputRef } =
    useRichTextMenuBar();

  if (!editor) {
    return null;
  }

  const getToggleButtonStyles = (theme: Theme, isActive: boolean) => ({
    borderRadius: "3px",
    backgroundColor: isActive ? theme.palette.primary.main : undefined,
    color: isActive ? theme.palette.primary.contrastText : undefined,
    transition: "background-color 0.2s, color 0.2s",
    border: "1px solid #E0E0E0",
    p: "5px",
    width: "30px",
    height: "30px",
    "& .MuiTouchRipple-child": { borderRadius: "inherit" },
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  });
  const renderFontVariants = () => (
    <Stack direction="row" spacing="2px">
      <Tooltip title="Grassetto">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          sx={(theme) => getToggleButtonStyles(theme, editor.isActive("bold"))}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Corsivo">
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive("italic"))
          }
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sottolineato">
        <IconButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive("underline"))
          }
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sbarrato">
        <IconButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive("strike"))
          }
        >
          <FormatStrikethroughIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
  const renderHeadingSelector = () => (
    <Select
      sx={{
        width: 150,
        "& .MuiSelect-select": {
          py: "7px",
        },
      }}
      onChange={(event) => {
        const textType: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = event
          .target.value as any;

        switch (textType) {
          case "p":
            editor.chain().focus().setParagraph().run();
            break;
          case "h1":
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            break;
          case "h2":
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            break;
          case "h3":
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            break;
          case "h4":
            editor.chain().focus().toggleHeading({ level: 4 }).run();
            break;
          case "h5":
            editor.chain().focus().toggleHeading({ level: 5 }).run();
            break;
          case "h6":
            editor.chain().focus().toggleHeading({ level: 6 }).run();
            break;
        }
      }}
      value={
        editor.isActive("heading")
          ? `h${editor.getAttributes("heading").level}`
          : "p"
      }
    >
      <MenuItem value={"p"}>Normale</MenuItem>
      <MenuItem value={"h1"}>Titolo 1</MenuItem>
      <MenuItem value={"h2"}>Titolo 2</MenuItem>
      <MenuItem value={"h3"}>Titolo 3</MenuItem>
      <MenuItem value={"h4"}>Titolo 4</MenuItem>
      <MenuItem value={"h5"}>Titolo 5</MenuItem>
      <MenuItem value={"h6"}>Titolo 6</MenuItem>
    </Select>
  );
  const renderListsControls = () => (
    <Stack direction="row" spacing="2px">
      <Tooltip title="Lista puntata">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive("bulletList"))
          }
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista numerata">
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive("orderedList"))
          }
        >
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Aumenta rientro">
        <IconButton
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
          disabled={
            !editor.can().chain().focus().sinkListItem("listItem").run()
          }
          sx={(theme) => getToggleButtonStyles(theme, false)}
        >
          <FormatIndentIncreaseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Diminuisci rientro">
        <IconButton
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
          disabled={
            !editor.can().chain().focus().liftListItem("listItem").run()
          }
          sx={(theme) => getToggleButtonStyles(theme, false)}
        >
          <FormatIndentDecreaseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
  const renderTextAlignments = () => (
    <Stack direction="row" spacing="2px">
      <Tooltip title="Allinea a sinistra">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={!editor.can().chain().focus().setTextAlign("left").run()}
          sx={(theme) =>
            getToggleButtonStyles(theme, editor.isActive({ textAlign: "left" }))
          }
        >
          <FormatAlignLeftIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Allinea al centro">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={!editor.can().chain().focus().setTextAlign("center").run()}
          sx={(theme) =>
            getToggleButtonStyles(
              theme,
              editor.isActive({ textAlign: "center" }),
            )
          }
        >
          <FormatAlignCenterIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Allinea a destra">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={!editor.can().chain().focus().setTextAlign("right").run()}
          sx={(theme) =>
            getToggleButtonStyles(
              theme,
              editor.isActive({ textAlign: "right" }),
            )
          }
        >
          <FormatAlignRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
  const renderColorControls = () => (
    <Stack direction="row" spacing="2px">
      <Box sx={{ position: "relative" }}>
        <Tooltip title="Colore">
          <IconButton
            onClick={() => {
              hiddenColorInputRef.current?.click();
            }}
            sx={(theme) => getToggleButtonStyles(theme, false)}
          >
            <FormatColorTextIcon
              sx={{ color: editor.getAttributes("textStyle").color }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
        <Box
          component="input"
          ref={hiddenColorInputRef}
          sx={{
            visibility: "hidden",
            pointerEvents: "none",
            position: "absolute",
          }}
          type="color"
          onChange={(e) => {
            editor.chain().focus().setColor(e.target.value).run();
          }}
        />
      </Box>
      <Box sx={{ position: "relative" }}>
        <Tooltip title="Evidenzia">
          <IconButton
            onClick={() => {
              hiddenHighlightInputRef.current?.click();
            }}
            sx={(theme) => getToggleButtonStyles(theme, false)}
          >
            <HighlightIcon
              sx={{ color: editor.getAttributes("highlight") }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
        <Box
          component="input"
          ref={hiddenHighlightInputRef}
          sx={{
            visibility: "hidden",
            pointerEvents: "none",
            position: "absolute",
          }}
          type="color"
          onChange={(e) => {
            editor
              .chain()
              .focus()
              .setHighlight({ color: e.target.value })
              .run();
          }}
        />
      </Box>
    </Stack>
  );
  const renderLinkControls = () => (
    <Stack direction="row" spacing="2px">
      <Tooltip title="Inserisci link">
        <IconButton
          onClick={() => {
            const url = window.prompt(
              "Inserisci l'URL",
              editor.getAttributes("link").href,
            );

            if (url) {
              editor
                .chain()
                .focus()
                .setLink({ href: url, target: "_blank" })
                .run();
            } else {
              editor.chain().focus().unsetLink().run();
            }
          }}
          sx={(theme) =>
            getToggleButtonStyles(
              theme,
              editor.getAttributes("link").href !== undefined,
            )
          }
        >
          <InsertLinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
  const renderUndoAndRedo = () => (
    <Stack direction="row" spacing="2px">
      <Tooltip title="Annulla">
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          sx={(theme) => getToggleButtonStyles(theme, false)}
        >
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Ripeti">
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          sx={(theme) => getToggleButtonStyles(theme, false)}
        >
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Stack
      direction="row"
      spacing={2}
      rowGap="5px"
      flexWrap="wrap"
      alignItems="center"
      sx={{ p: 1, borderBottom: "1px solid #E0E0E0" }}
    >
      {renderFontVariants()}
      {renderHeadingSelector()}
      {renderListsControls()}
      {renderTextAlignments()}
      {renderColorControls()}
      {renderLinkControls()}
      {renderUndoAndRedo()}
    </Stack>
  );
});

RichTextMenuBar.displayName = "RichTextMenuBar";
