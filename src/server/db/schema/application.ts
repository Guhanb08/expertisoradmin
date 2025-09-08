import {
  pgTable,
  timestamp,
  uuid,
  text,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { applicationStatus } from "./enum";

export const application = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").notNull(),
  jobId: uuid("job_id").notNull(),
  status: applicationStatus("status").notNull().default("pending"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
