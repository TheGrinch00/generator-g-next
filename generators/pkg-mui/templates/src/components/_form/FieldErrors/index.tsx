import { AnyFieldMeta } from "@tanstack/form-core";
import { ZodError } from "zod";
import { Box, FormHelperText } from "@mui/material";

type FieldErrorsProps = {
  meta: AnyFieldMeta;
};

export const FieldErrors = ({ meta }: FieldErrorsProps) => {
  if (!meta.isTouched || meta.errors.length === 0) {
    return null;
  }

  return (
    <Box>
      {meta.errors.map(({ message }: ZodError, index) => (
        <FormHelperText key={index} error>
          {message}
        </FormHelperText>
      ))}
    </Box>
  );
};
