import {
  Checkbox,
  CheckboxProps,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { useFormCheckbox } from "./index.hooks";
import { FieldErrors } from "@/components/_form/FieldErrors";

type FormCheckboxProps = {
  label?: string;
} & Omit<CheckboxProps, "value" | "checked" | "onChange">;

export const FormCheckbox = ({
  label,
  disabled = false,
  ...props
}: FormCheckboxProps) => {
  const { field } = useFormCheckbox();

  return (
    <FormControl
      error={field.state.meta.errors.length > 0}
      component="fieldset"
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={field.state.value}
            onChange={(ev) => field.handleChange(ev.target.checked)}
            {...props}
          />
        }
        label={label}
      />
      <FieldErrors meta={field.state.meta} />
    </FormControl>
  );
};

FormCheckbox.displayName = "FormCheckbox";
