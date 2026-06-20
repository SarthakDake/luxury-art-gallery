import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

const isCiBuild = Boolean(process.env.VERCEL || process.env.CI);
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if (isCiBuild) {
  if (hasDatabaseUrl) {
    console.log("[build] Applying database migrations…");
    run("npx prisma migrate deploy");
  } else {
    console.warn(
      "[build] DATABASE_URL is not set. Skipping migrations. Set it in your host env vars before deploying.",
    );
  }
}

run("npx prisma generate");
run("npx next build");
