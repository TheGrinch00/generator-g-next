import { useFieldContext } from "@/components/_form";
import React, { useCallback, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ColorResult } from "react-color";

const suggestedColors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
] as const;

export const useFormColorPicker = () => {
  const theme = useTheme();

  const field = useFieldContext<string>();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleColorChange = useCallback(
    (color: ColorResult) => {
      field.handleChange(color.hex);
    },
    [field],
  );

  const open = Boolean(anchorEl);

  return {
    field,
    suggestedColors,
    anchorEl,
    open,
    handleOpen,
    handleClose,
    handleColorChange,
    theme,
  };
};
