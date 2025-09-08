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
  candidateId: uuid("candidate_id").notNull(),
  title: varchar("title"),
  content: text("content"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
