import { execSync } from "node:child_process";
import { deployMigrations } from "./db-baseline.mjs";

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

const isCiBuild = Boolean(process.env.VERCEL || process.env.CI);
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if (isCiBuild) {
  if (hasDatabaseUrl) {
    console.log("[build] Syncing database schema…");
    deployMigrations();
  } else {
    console.warn(
      "[build] DATABASE_URL is not set. Skipping migrations. Set it in your host env vars before deploying.",
    );
  }
}

run("npx prisma generate");
run("npx next build");
