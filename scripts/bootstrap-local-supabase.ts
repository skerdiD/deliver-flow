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
    .replace(
      /CREATE SCHEMA "auth";\s*--> statement-breakpoint\s*/,
      "",
    )
    .replace(
      /CREATE TABLE "auth"\."users" \([\s\S]*?\);\s*--> statement-breakpoint\s*/,
      "",
    );
}

async function executeDrizzleHistory() {
  const drizzleDirectory = join(process.cwd(), "drizzle");
  const migrationFiles = (await readdir(drizzleDirectory))
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();

  for (const [index, file] of migrationFiles.entries()) {
    const raw = await readFile(join(drizzleDirectory, file), "utf8");
    const source = index === 0 ? removeSupabaseOwnedAuthDDL(raw) : raw;
    const statements = source
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }
  }
}

async function main() {
  console.log("Bootstrapping the DeliverFlow schema in local Supabase...");
  await executeDrizzleHistory();

  const securitySql = await readFile(
    join(
      process.cwd(),
      "supabase",
      "migrations",
      "0007_current_security_baseline.sql",
    ),
    "utf8",
  );

  await sql.unsafe(securitySql);
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
