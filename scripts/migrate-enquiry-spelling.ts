/**
 * One-time (or idempotent) migration: rewrite legacy "inquiry" keys/copy in
 * SiteContent.config JSON and persist the normalized SiteConfig shape.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run db:migrate-enquiry-spelling
 */
import type pg from "pg";
import { normalizeSiteConfig } from "../src/lib/site-config/normalize";
import { withPgClient } from "./db-pg.mjs";

async function migrateConfigRow(): Promise<void> {
  await withPgClient(async (client: pg.Client) => {
    const result = await client.query('SELECT data FROM "SiteContent" WHERE key = $1', [
      "config",
    ]);

    if (result.rowCount === 0) {
      console.log("[migrate-enquiry] No config row in SiteContent — nothing to do.");
      return;
    }

    const raw = result.rows[0].data as unknown;
    const normalized = normalizeSiteConfig(raw);

    await client.query(
      'UPDATE "SiteContent" SET data = $2::jsonb, "updatedAt" = NOW() WHERE key = $1',
      ["config", JSON.stringify(normalized)],
    );

    console.log("[migrate-enquiry] Updated SiteContent.config with enquiry spelling.");
  });
}

migrateConfigRow().catch((error) => {
  console.error("[migrate-enquiry] Failed:", error);
  process.exit(1);
});
