import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

export type AppButtonProps = {
  loading?: boolean;
} & ButtonProps;

export const AppButton = ({ loading = false, ...props }: AppButtonProps) => {
  return (
    <Button
      {...props}
      startIcon={
        loading ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          props.startIcon
        )
      }
    />
  );
};

AppButton.displayName = "AppButton";
