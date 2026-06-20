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

export function deployMigrations() {
  let result = runCapture("npx prisma migrate deploy");

  if (result.ok) {
    console.log("[db] Migrations applied.");
    return;
  }

  if (!result.output.includes("P3005")) {
    console.error(result.output);
    throw result.error ?? new Error("prisma migrate deploy failed");
  }

  console.log(
    "[db] Existing database detected (P3005). Baselining migration history…",
  );

  resolveMigration(INIT_MIGRATION);

  result = runCapture("npx prisma migrate deploy");

  if (result.ok) {
    console.log("[db] Pending migrations applied after baseline.");
    return;
  }

  if (result.output.includes("P3005")) {
    const pending = listMigrations().filter((name) => name !== INIT_MIGRATION);

    for (const migration of pending) {
      resolveMigration(migration);
    }

    result = runCapture("npx prisma migrate deploy");

    if (result.ok) {
      console.log("[db] Migration history baselined.");
      return;
    }
  }

  console.error(result.output);
  throw result.error ?? new Error("prisma migrate deploy failed after baseline");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deployMigrations();
}
