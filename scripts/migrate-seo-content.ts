/**
 * Idempotent migration: merge bundled SEO copy from src/data/config.json into
 * production SiteContent.config when fields are still empty.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run db:migrate-seo-content
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type pg from "pg";
import { mergeBundledSeoIntoConfig } from "../src/lib/site-config/merge-bundled-seo";
import { normalizeSiteConfig } from "../src/lib/site-config/normalize";
import type { SiteConfig } from "../src/types/site-config";
import { withPgClient } from "./db-pg.mjs";

function loadBundledConfig(): SiteConfig {
  const filePath = path.join(process.cwd(), "src/data/config.json");
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  return normalizeSiteConfig(raw);
}

async function migrateConfigRow(): Promise<void> {
  const bundled = loadBundledConfig();

  await withPgClient(async (client: pg.Client) => {
    const result = await client.query('SELECT data FROM "SiteContent" WHERE key = $1', [
      "config",
    ]);

    if (result.rowCount === 0) {
      console.log("[migrate-seo] No config row — seed will apply bundled config on next deploy.");
      return;
    }

    const raw = result.rows[0].data as unknown;
    const existing = normalizeSiteConfig(raw);
    const merged = mergeBundledSeoIntoConfig(existing, bundled);

    await client.query(
      'UPDATE "SiteContent" SET data = $2::jsonb, "updatedAt" = NOW() WHERE key = $1',
      ["config", JSON.stringify(merged)],
    );

    console.log("[migrate-seo] Merged bundled SEO fields into SiteContent.config.");
  });
}

migrateConfigRow().catch((error) => {
  console.error("[migrate-seo] Failed:", error);
  process.exit(1);
});
