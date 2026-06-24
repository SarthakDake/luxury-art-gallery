import { execSync } from "node:child_process";
import { deployMigrations } from "./db-baseline.mjs";
import { seedSiteContent } from "./seed-site-content.mjs";

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

async function main() {
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
      console.warn(
        "[build] DATABASE_URL is not set. Skipping migrations. Set it in your host env vars before deploying.",
      );
    }
  }

  run("npx next build");
}

main().catch((error) => {
  console.error("[build] Failed:", error);
  process.exit(1);
});
