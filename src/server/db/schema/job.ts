import {
  pgTable,
  timestamp,
  uuid,
  text,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const job = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title"),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
