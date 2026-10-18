// Production build entrypoint (`npm run build`). Wraps the plain
// `next build` with two extra steps that only make sense on a CI/hosting
// platform, never on a developer's own machine mid-edit:
//   1. Apply pending Prisma migrations (self-healing — see db-baseline.mjs).
//   2. Seed the CMS `SiteContent` rows the very first time (never overwrites
//      existing content — see seed-site-content.mjs).
// `npm run build:local` skips this file entirely for a plain local build.
import { execSync } from "node:child_process";
import { deployMigrations } from "./db-baseline.mjs";
import { normalizeDatabaseUrl } from "./pg-connection.mjs";
import { seedSiteContent } from "./seed-site-content.mjs";

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

async function main() {
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
  }
  // VERCEL / CI env vars are set automatically by hosting platforms — used
  // here to distinguish "real deploy" from a plain local `next build`, since
  // running migrations locally against whatever DATABASE_URL happens to be
  // set could unintentionally touch a shared/production database.
  const isCiBuild = Boolean(process.env.VERCEL || process.env.CI);
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  run("npx prisma generate");

  if (isCiBuild) {
    if (hasDatabaseUrl) {
      console.log("[build] Syncing database schema…");
      await deployMigrations();
      console.log("[build] Seeding site content if needed…");
      await seedSiteContent();
    } else {
      // Don't hard-fail the build: some platforms run a build step before
      // env vars are attached, or a preview build may intentionally have no
      // database. next build will still succeed; the app just won't have
      // working DB-backed features until DATABASE_URL is configured.
      console.warn(
        "[build] DATABASE_URL is not set. Skipping migrations. Set it in your host env vars before deploying.",
      );
    }
  }

  // Webpack avoids Turbopack production failures with next/font/google on Vercel
  // (e.g. Can't resolve '@vercel/turbopack-next/internal/font/google/font').
  run("npx next build --webpack");
}

main().catch((error) => {
  console.error("[build] Failed:", error);
  process.exit(1);
});
