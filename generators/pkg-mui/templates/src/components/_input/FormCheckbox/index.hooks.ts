import { useFieldContext } from "@/components/_form";

export const useFormCheckbox = () => {
  const field = useFieldContext<boolean>();

  return { field };
};
