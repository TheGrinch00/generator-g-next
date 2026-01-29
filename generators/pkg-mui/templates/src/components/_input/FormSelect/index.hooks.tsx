import { useFieldContext } from "@/components/_form";

export const useFormDeadlineModeSelect = () => {
  const field = useFieldContext<number | number[] | null>();

  return {
    field,
  };
};
