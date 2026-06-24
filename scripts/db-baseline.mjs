import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withPgClient } from "./db-pg.mjs";

const INIT_MIGRATION = "20250620120000_init";
const SITE_CONTENT_MIGRATION = "20250622120000_add_site_content";

function run(command, { inherit = true } = {}) {
  return execSync(command, {
    stdio: inherit ? "inherit" : "pipe",
    env: process.env,
    encoding: "utf8",
  });
}

function runCapture(command) {
  try {
    const stdout = run(command, { inherit: false });
    return { ok: true, output: stdout ?? "" };
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    return { ok: false, output, error };
  }
}

function listMigrations() {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

function resolveMigration(name) {
  console.log(`[db] Marking migration as applied: ${name}`);
  run(`npx prisma migrate resolve --applied ${name}`);
}

function extractFailedMigrations(output) {
  const migrations = new Set();

  for (const match of output.matchAll(/Migration name: ([^\s\n]+)/g)) {
    migrations.add(match[1]);
  }

  for (const match of output.matchAll(/The `([^`]+)` migration/g)) {
    migrations.add(match[1]);
  }

  return [...migrations];
}

function isDuplicateObjectError(output) {
  return (
    output.includes("42P07") ||
    output.includes("42701") ||
    /already exists/i.test(output)
  );
}

async function canMarkMigrationApplied(migration) {
  if (migration !== SITE_CONTENT_MIGRATION) {
    return true;
  }

  try {
    return await withPgClient(async (client) => {
      const result = await client.query(
        `SELECT to_regclass('public."SiteContent"') IS NOT NULL AS "exists"`,
      );
      return result.rows[0]?.exists === true;
    });
  } catch (error) {
    console.warn("[db] Could not verify SiteContent table:", error);
    return false;
  }
}

function baselineExistingDatabase() {
  console.log(
    "[db] Existing database detected (P3005). Baselining migration history…",
  );

  resolveMigration(INIT_MIGRATION);

  let result = runCapture("npx prisma migrate deploy");

  if (result.ok) {
    console.log("[db] Pending migrations applied after baseline.");
    return true;
  }

  if (result.output.includes("P3005")) {
    const pending = listMigrations().filter((name) => name !== INIT_MIGRATION);

    for (const migration of pending) {
      resolveMigration(migration);
    }

    result = runCapture("npx prisma migrate deploy");

    if (result.ok) {
      console.log("[db] Migration history baselined.");
      return true;
    }
  }

  console.error(result.output);
  throw result.error ?? new Error("prisma migrate deploy failed after baseline");
}

async function recoverFailedMigrations(output) {
  const migrations = extractFailedMigrations(output);

  if (migrations.length === 0) {
    return false;
  }

  let recovered = false;

  for (const migration of migrations) {
    const canResolve =
      output.includes("P3009") ||
      (output.includes("P3018") && isDuplicateObjectError(output));

    if (!canResolve) {
      continue;
    }

    if (!(await canMarkMigrationApplied(migration))) {
      console.warn(
        `[db] Skipping auto-resolve for ${migration}; expected database objects are missing.`,
      );
      continue;
    }

    console.log(`[db] Recovering failed migration ${migration}…`);
    resolveMigration(migration);
    recovered = true;
  }

  return recovered;
}

export async function deployMigrations() {
  const maxAttempts = listMigrations().length + 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = runCapture("npx prisma migrate deploy");

    if (result.ok) {
      console.log("[db] Migrations applied.");
      return;
    }

    const output = result.output;

    if (output.includes("P3009") || output.includes("P3018")) {
      const recovered = await recoverFailedMigrations(output);

      if (recovered) {
        continue;
      }
    }

    if (output.includes("P3005")) {
      baselineExistingDatabase();
      return;
    }

    console.error(output);
    throw result.error ?? new Error("prisma migrate deploy failed");
  }

  throw new Error("prisma migrate deploy failed after recovery attempts");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deployMigrations().catch((error) => {
    console.error("[db] Migration deploy failed:", error);
    process.exit(1);
  });
}
