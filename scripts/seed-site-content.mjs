// Seeds the CMS `SiteContent` table from the JSON files bundled in the repo
// (src/data/*.json). Runs on every production build (see vercel-build.mjs)
// but is intentionally insert-only: it never overwrites a row that already
// exists, so content edited live via the admin Content Studio always wins
// over what's checked into git.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withPgClient } from "./db-pg.mjs";

const seeds = [
  { key: "artworks", file: "src/data/artworks.json" },
  { key: "config", file: "src/data/config.json" },
  { key: "profile", file: "src/data/profile.json" },
];

export async function seedSiteContent() {
  await withPgClient(async (client) => {
    for (const seed of seeds) {
      const existing = await client.query(
        'SELECT key FROM "SiteContent" WHERE key = $1',
        [seed.key],
      );

      if (existing.rowCount > 0) {
        // Never overwrite: production content is authoritative once it exists.
        console.log(`[seed] Site content already exists: ${seed.key}`);
        continue;
      }

      const filePath = path.join(process.cwd(), seed.file);
      const data = JSON.parse(readFileSync(filePath, "utf8"));

      await client.query(
        'INSERT INTO "SiteContent" (key, data, "updatedAt") VALUES ($1, $2::jsonb, NOW())',
        [seed.key, JSON.stringify(data)],
      );

      console.log(`[seed] Created site content: ${seed.key}`);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedSiteContent().catch((error) => {
    console.error("[seed] Failed to seed site content:", error);
    process.exit(1);
  });
}
