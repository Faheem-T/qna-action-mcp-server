import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/infrastructure/db/schemas",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    user: "postgres",
  },
});
