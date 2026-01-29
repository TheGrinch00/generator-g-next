import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useFieldContext } from "@/components/_form";
import { Box } from "@mui/material";
import { FieldErrors } from "@/components/_form/FieldErrors";

type FormDatePickerProps = {
  fullWidth?: boolean;
} & Omit<DatePickerProps<Dayjs>, "value" | "onChange">;

export const FormDatePicker = ({
  fullWidth = false,
  ...props
}: FormDatePickerProps) => {
  const field = useFieldContext<Dayjs | null>();

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <DatePicker
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        sx={{
          width: fullWidth ? "100%" : "auto",
        }}
        {...props}
      />
      <FieldErrors meta={field.state.meta} />
    </Box>
  );
};

FormDatePicker.displayName = "FormDatePicker";
