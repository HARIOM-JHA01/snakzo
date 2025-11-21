import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig } from "prisma/config";

expand(config({ path: ".env.local" }));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use a placeholder URL if DATABASE_URL is not set (e.g., during dependency installation)
    // Prisma client generation doesn't need a real DB connection
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
