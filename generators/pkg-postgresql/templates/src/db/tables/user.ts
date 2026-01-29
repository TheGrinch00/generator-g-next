import {
  pgTable,
  uniqueIndex,
  boolean,
  serial,
  text,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";

import { customTimestamp } from "@/db/customColumns/customTimestamp";

export const UserTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    hashedPassword: text("hashed_password").notNull(),
    disabled: boolean("disabled").default(false).notNull(),
    createdAt: customTimestamp("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: customTimestamp("updated_at")
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [uniqueIndex("idx_user_email").on(table.email)],
);

export const UserRelations = relations(UserTable, ({ many }) => ({}));
