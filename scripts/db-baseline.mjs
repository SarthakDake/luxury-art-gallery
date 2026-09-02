// Self-healing wrapper around `prisma migrate deploy`, built to handle three
// real-world failure modes we've hit against production databases that were
// not created purely through Prisma migrations:
//   - P3005: the database already has tables (e.g. it was set up with
//     `prisma db push`, or pre-dates migrations) — Prisma refuses to run
//     migrations against a "non-empty" schema until it's baselined.
//   - P3009 / P3018: a migration is recorded as failed, or fails to (re)apply
//     because the objects it creates already exist. This happens when a
//     previous deploy partially succeeded (e.g. deploy was interrupted).
// Rather than requiring a human to SSH in and run `prisma migrate resolve`
// by hand on every affected environment, this script detects these error
// codes from Prisma's CLI output and resolves them automatically.
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withPgClient } from "./db-pg.mjs";

const INIT_MIGRATION = "20250620120000_init";
// This migration is only safe to mark "applied without running" if the table
// it creates is actually present — otherwise we'd hide a real missing-table
// bug behind a false "migration succeeded" state. See canMarkMigrationApplied.
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

// Guard against blindly marking a migration "applied" when it wouldn't
// actually have created its table — that would leave the DB permanently
// missing SiteContent while Prisma believes the schema is up to date.
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

// Marks the `init` migration as already applied (it corresponds to the
// schema `db push` would have already created), then retries. If Prisma
// still reports P3005 after that — meaning later migrations also collide
// with existing objects — we widen the baseline to every migration so the
// history matches reality, then retry once more.
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

// P3009 means a migration is already flagged failed in the _prisma_migrations
// table; P3018 means the migration failed to apply. We only auto-resolve
// P3018 when the underlying error is "object already exists" — i.e. the
// migration's effect is already in place and only Prisma's bookkeeping is
// out of sync. Any other P3018 cause is a real failure and must not be
// silently marked as applied.
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

// Entry point used by scripts/vercel-build.mjs on every production deploy.
// Bounded retry loop: each iteration can resolve at most the failed
// migrations it finds, so in the worst case (every migration individually
// failed) we need up to one attempt per migration, plus a few for the
// initial attempt/baseline/final-verify passes.
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
