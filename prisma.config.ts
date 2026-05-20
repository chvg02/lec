import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const directDatabaseUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/ensure-default-admin.cjs",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    ...(directDatabaseUrl ? { directUrl: directDatabaseUrl } : {}),
  },
});
