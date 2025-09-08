import {
  pgTable,
  timestamp,
  uuid,
  text,
} from "drizzle-orm/pg-core";

export const socialLink = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),

  platform: text("platform").notNull(),
  label: text("label"),
  url: text("url").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
