import { useFieldContext } from "@/components/_form";

export const useFormNumericFormat = () => {
  const field = useFieldContext<number | null>();

  return { field };
};
