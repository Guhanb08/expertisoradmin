import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "candidate", "client"]);

export const applicationStatus = pgEnum("application_status", [
  "pending",
  "shortlisted",
  "rejected",
]);