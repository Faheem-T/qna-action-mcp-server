import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(
  process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432",
);

await db.execute("select 'Hello there'");

console.log("Connected to DB successfully");
