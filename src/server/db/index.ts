import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: PostgresJsDatabase;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  try {
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client);
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }

export { db };
