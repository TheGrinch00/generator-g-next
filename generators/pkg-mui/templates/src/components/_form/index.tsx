import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { FormCheckbox } from "@/components/_input/FormCheckbox";
import { FormColorPicker } from "@/components/_input/FormColorPicker";
import { FormDatePicker } from "@/components/_input/FormDatePicker";
import { FormNumericFormat } from "@/components/_input/FormNumericFormat";
import { FormRichTextField } from "@/components/_input/FormRichTextField";
import { FormSelect } from "@/components/_input/FormSelect";
import { FormTextField } from "@/components/_input/FormTextField";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FormCheckbox,
    FormColorPicker,
    FormDatePicker,
    FormNumericFormat,
    FormRichTextField,
    FormSelect,
    FormTextField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
