import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { userRole } from "./enum";

export const profile = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRole("role").notNull(),
  userId: uuid("user_id").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
