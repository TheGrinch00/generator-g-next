import React, { memo } from "react";
import { useFormNumericFormat } from "./index.hooks";
import { TextField, TextFieldProps } from "@mui/material";
import { NumberFormatValues, NumericFormat } from "react-number-format";

const CustomOutlinedTextField = memo((props: TextFieldProps) => {
  return <TextField {...props} fullWidth variant="outlined" />;
});

type FormNumericFormatProps = {
  numericFormatProps?: {
    decimalScale?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
    allowNegative?: boolean;
    fixedDecimalScale?: boolean;
    isAllowed?: ((values: NumberFormatValues) => boolean) | undefined;
  };
  textFieldProps?: Omit<TextFieldProps, "value" | "defaultValue" | "type">;
};

export const FormNumericFormat = ({
  numericFormatProps,
  textFieldProps,
}: FormNumericFormatProps) => {
  const { field } = useFormNumericFormat();

  const decimalScale = numericFormatProps?.decimalScale ?? 2;

  return (
    <NumericFormat
      customInput={CustomOutlinedTextField}
      label={textFieldProps?.label}
      fullWidth={textFieldProps?.fullWidth}
      allowNegative={numericFormatProps?.allowNegative ?? false}
      thousandSeparator={numericFormatProps?.thousandSeparator ?? "."}
      decimalSeparator={numericFormatProps?.decimalSeparator ?? ","}
      decimalScale={numericFormatProps?.decimalScale ?? 2}
      prefix={numericFormatProps?.prefix}
      suffix={numericFormatProps?.suffix}
      fixedDecimalScale={numericFormatProps?.fixedDecimalScale ?? false}
      isAllowed={numericFormatProps?.isAllowed}
      onValueChange={(values) => {
        field.handleChange(
          values.floatValue != null
            ? Math.round(values.floatValue * 10 ** decimalScale)
            : 0,
        );
      }}
      value={
        field.state.value != null ? field.state.value / 10 ** decimalScale : 0
      }
    />
  );
};

FormNumericFormat.displayName = "FormNumericFormat";
