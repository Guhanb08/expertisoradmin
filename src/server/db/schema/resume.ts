import {
  pgTable,
  timestamp,
  uuid,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const resume = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary"),
  experience: text("experience"),
  education: text("education"),
  skills: text("skills"),
  contact: text("contact"),
  fileUrl: varchar("file_url"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
