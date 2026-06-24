import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INIT_MIGRATION = "20250620120000_init";

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

function extractFailedMigration(output) {
  const match = output.match(/Migration name: ([^\s\n]+)/);
  return match?.[1] ?? null;
}

function isDuplicateObjectError(output) {
  return (
    output.includes("42P07") ||
    output.includes("42701") ||
    /already exists/i.test(output)
  );
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

export function deployMigrations() {
  const maxAttempts = listMigrations().length + 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = runCapture("npx prisma migrate deploy");

    if (result.ok) {
      console.log("[db] Migrations applied.");
      return;
    }

    const output = result.output;

    if (output.includes("P3018") && isDuplicateObjectError(output)) {
      const migration = extractFailedMigration(output);

      if (migration) {
        console.log(
          `[db] Migration ${migration} targets objects that already exist. Recovering…`,
        );
        resolveMigration(migration);
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
  deployMigrations();
}
