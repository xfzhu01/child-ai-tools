import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Placeholder for `prisma generate` when DATABASE_URL is not set (e.g. CI postinstall). */
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/child_ai_tools?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
