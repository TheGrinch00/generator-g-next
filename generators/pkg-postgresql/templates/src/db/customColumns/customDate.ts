import dayjs from "dayjs";
import { customType } from "drizzle-orm/pg-core";

export const customDate = (name: string) =>
  customType<{ data: Date; driverData: string }>({
    dataType() {
      return "date";
    },
    toDriver(value: Date): string {
      // Converte Date in stringa 'YYYY-MM-DD'
      return dayjs(value).format("YYYY-MM-DD");
    },
    fromDriver(value: string): Date {
      // Converte stringa 'YYYY-MM-DD' in oggetto Date
      return dayjs(value, "YYYY-MM-DD").toDate();
    },
  })(name).$type<Date>();
