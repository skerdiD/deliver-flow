import { config } from "dotenv";

config({ path: ".env.local" });

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL.");
}

const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
});

function removeSupabaseOwnedAuthDDL(source: string) {
  return source
    .replace(/CREATE SCHEMA "auth";\s*--> statement-breakpoint\s*/, "")
    .replace(
      /CREATE TABLE "auth"\."users" \([\s\S]*?\);\s*--> statement-breakpoint\s*/,
      "",
    );
}

async function getDrizzleMigrationFiles() {
  const drizzleDirectory = join(process.cwd(), "drizzle");
  return (await readdir(drizzleDirectory))
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();
}

async function executeDrizzleHistory(migrationFiles: string[]) {
  const drizzleDirectory = join(process.cwd(), "drizzle");

  for (const file of migrationFiles) {
    const raw = await readFile(join(drizzleDirectory, file), "utf8");
    const source = file.startsWith("0000_")
      ? removeSupabaseOwnedAuthDDL(raw)
      : raw;
    const statements = source
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }
  }
}

async function executeSecurityMigration(file: string) {
  const source = await readFile(
    join(process.cwd(), "supabase", "migrations", file),
    "utf8",
  );
  await sql.unsafe(source);
}

async function main() {
  console.log("Bootstrapping the DeliverFlow schema in local Supabase...");
  const drizzleMigrations = await getDrizzleMigrationFiles();
  const fileSecurityCleanupIndex = drizzleMigrations.findIndex((file) =>
    file.startsWith("0012_"),
  );

  if (fileSecurityCleanupIndex < 0) {
    throw new Error("Missing Drizzle file-security cleanup migration 0012.");
  }

  await executeDrizzleHistory(
    drizzleMigrations.slice(0, fileSecurityCleanupIndex),
  );
  await executeSecurityMigration("0007_current_security_baseline.sql");
  await executeDrizzleHistory(
    drizzleMigrations.slice(fileSecurityCleanupIndex),
  );
  await executeSecurityMigration("0008_rls_file_access_cleanup.sql");
  console.log("Local Supabase schema and security baseline are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
