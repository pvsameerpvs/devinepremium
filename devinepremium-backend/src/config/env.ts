import "dotenv/config";

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function splitCsv(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const databaseDriver =
  process.env.DATABASE_DRIVER === "postgres" ? "postgres" : "sqlite";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  DATABASE_DRIVER: databaseDriver,
  DATABASE_SQLITE_PATH:
    process.env.DATABASE_SQLITE_PATH || "data/devinepremium.sqlite",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_SSL: toBoolean(process.env.DATABASE_SSL, true),
  DB_SYNCHRONIZE: toBoolean(
    process.env.DB_SYNCHRONIZE,
    databaseDriver === "sqlite" && process.env.NODE_ENV !== "production",
  ),
  JWT_SECRET: process.env.JWT_SECRET || "devinepremium-local-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGINS: splitCsv(process.env.CORS_ORIGINS, [
    "http://localhost:3000",
    "http://localhost:3001",
  ]),
  SEED_ADMIN_EMAIL:
    process.env.SEED_ADMIN_EMAIL || "admin@devinepremium.com",
  SEED_ADMIN_PASSWORD:
    process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
} as const;
