import { useFieldContext } from "@/components/_form";
import { Stack, TextField, TextFieldProps } from "@mui/material";
import { FieldErrors } from "@/components/_form/FieldErrors";

type FormTextFieldProps = {} & Omit<
  TextFieldProps,
  "name" | "onChange" | "value"
>;

export const FormTextField = ({
  label,
  InputProps,
  ...props
}: FormTextFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <Stack sx={{ width: props.fullWidth ? "100%" : undefined }}>
      <TextField
        name={field.name}
        variant="outlined"
        label={label}
        value={field.state.value ?? ""}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldErrors meta={field.state.meta} />
    </Stack>
  );
};
