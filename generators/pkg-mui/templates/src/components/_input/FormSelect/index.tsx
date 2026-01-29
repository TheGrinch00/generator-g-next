import { useFormDeadlineModeSelect as useFormSelect } from "./index.hooks";
import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { FieldErrors } from "@/components/_form/FieldErrors";

type FormSelectProps = {
  label?: string;
  disabled?: boolean;
  multiple?: boolean;
  options: {
    value: number;
    label: string;
  }[];
} & Omit<FormControlProps, "name" | "onChange">;

export const FormSelect = ({
  label,
  disabled = false,
  multiple = false,
  options,
  ...props
}: FormSelectProps) => {
  const { field } = useFormSelect();

  return (
    <FormControl
      error={(field.state.meta.errors ?? []).length > 0}
      variant="outlined"
      {...props}
    >
      {label && <InputLabel id="mui-select">{label}</InputLabel>}
      <Select
        labelId={label ? "mui-select" : ""}
        variant="outlined"
        label={label}
        value={field.state.value ?? null}
        onChange={(ev) =>
          field.handleChange(ev.target.value as number | number[])
        }
        disabled={disabled}
        error={(field.state.meta.errors ?? []).length > 0}
        multiple={multiple}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FieldErrors meta={field.state.meta} />
    </FormControl>
  );
};

FormSelect.displayName = "FormSelect";
