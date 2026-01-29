import React, { memo } from "react";
import { useFormColorPicker } from "./index.hooks";
import { Box, Button, Paper, Popover, Stack } from "@mui/material";
import { SketchPicker } from "react-color";

type FormColorPickerProps = {};

export const FormColorPicker = ({}: FormColorPickerProps) => {
  const {
    field,
    suggestedColors,
    anchorEl,
    open,
    handleOpen,
    handleClose,
    handleColorChange,
    theme,
  } = useFormColorPicker();

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={(theme) => ({
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.divider,
          color: field.state.value,
          p: 1,
          width: "fit-content",
          minWidth: "unset",
        })}
      >
        <Paper
          sx={{
            backgroundColor: field.state.value,
            py: 1,
            px: 2,
            borderRadius: "5px",
          }}
        />
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            p: 2,
            width: "250px",
            "& .sketch-picker": {
              backgroundColor: `transparent !important`,
              padding: "0 !important",
              boxShadow: "none !important",
              width: "100%!important",
            },
          }}
        >
          <SketchPicker
            color={field.state.value}
            onChange={handleColorChange}
            disableAlpha
            presetColors={[]}
          />
          <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
            {suggestedColors.map((color: string) => (
              <Box
                key={color}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  backgroundColor: color,
                  cursor: "pointer",
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
                onClick={() => {
                  handleColorChange({
                    hex: color,
                  } as any);
                  handleClose();
                }}
              />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
FormColorPicker.displayName = "FormColorPicker";
