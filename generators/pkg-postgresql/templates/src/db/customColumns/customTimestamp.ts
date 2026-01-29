import { customType } from "drizzle-orm/pg-core";
import dayjs from "dayjs";

export const customTimestamp = (name: string) =>
  customType<{ data: Date; driverData: string }>({
    dataType() {
      return "timestamp with time zone";
    },
    toDriver(value: Date): string {
      return value.toISOString();
    },
    fromDriver(value: string): Date {
      return dayjs(value).toDate();
    },
  })(name).$type<Date>();
