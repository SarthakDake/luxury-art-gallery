import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { head } from "@vercel/blob";
import { withPgClient } from "./db-pg.mjs";
import { getBlobAccess } from "./blob-storage.mjs";

const contentFiles = [
  { key: "artworks", file: "src/data/artworks.json", blobPath: "site-content/artworks.json" },
  { key: "config", file: "src/data/config.json", blobPath: "site-content/config.json" },
  { key: "profile", file: "src/data/profile.json", blobPath: "site-content/profile.json" },
];

function writeContentFile(relativePath, data) {
  const filePath = path.join(process.cwd(), relativePath);
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function syncSiteContentFromDatabase() {
  const mirrored = [];

  await withPgClient(async (client) => {
    for (const entry of contentFiles) {
      const result = await client.query(
        'SELECT data FROM "SiteContent" WHERE key = $1',
        [entry.key],
      );

      if (result.rowCount === 0) {
        console.warn(`[sync] No database row for ${entry.key}, skipping.`);
        continue;
      }

      writeContentFile(entry.file, result.rows[0].data);
      mirrored.push(entry.file);
      console.log(`[sync] Wrote ${entry.file} from database`);
    }
  });

  if (mirrored.length === 0) {
    throw new Error("No site content rows found in the database.");
  }

  console.log(`[sync] Mirrored ${mirrored.length} file(s) from database.`);
}

export async function syncSiteContentFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to sync site content from Blob.");
  }

  const mirrored = [];

  for (const entry of contentFiles) {
    try {
      const metadata = await head(entry.blobPath, { access: getBlobAccess() });
      const response = await fetch(metadata.url);

      if (!response.ok) {
        throw new Error(`Failed to download ${entry.blobPath} (${response.status})`);
      }

      const text = await response.text();
      const filePath = path.join(process.cwd(), entry.file);
      writeFileSync(filePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
      mirrored.push(entry.file);
      console.log(`[sync] Wrote ${entry.file} from blob`);
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) {
        console.warn(`[sync] No blob for ${entry.key}, skipping.`);
        continue;
      }

      throw error;
    }
  }

  if (mirrored.length === 0) {
    throw new Error("No site content JSON blobs found.");
  }

  console.log(`[sync] Mirrored ${mirrored.length} file(s) from blob.`);
}

async function main() {
  const source = process.argv.includes("--from-blob") ? "blob" : "database";

  if (source === "blob") {
    await syncSiteContentFromBlob();
    return;
  }

  await syncSiteContentFromDatabase();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[sync] Failed to sync site content:", error);
    process.exit(1);
  });
}
