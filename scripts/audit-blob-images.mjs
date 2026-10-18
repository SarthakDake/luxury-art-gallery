/**
 * Read-only audit: list artwork image paths in Postgres/JSON that are missing
 * from Vercel Blob. Does not delete or modify any data.
 *
 * Usage:
 *   DATABASE_URL="..." BLOB_READ_WRITE_TOKEN="..." node scripts/audit-blob-images.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { head } from "@vercel/blob";
import { withPgClient } from "./db-pg.mjs";
import { getBlobAccess } from "./blob-storage.mjs";

function splitPathAndQuery(src) {
  const queryIndex = src.indexOf("?");
  if (queryIndex === -1) {
    return src.replace(/^\/+/, "");
  }
  return src.slice(0, queryIndex).replace(/^\/+/, "");
}

function collectImagePaths(artworks) {
  const paths = new Set();
  for (const artwork of artworks) {
    if (typeof artwork.imageUrl === "string") {
      paths.add(splitPathAndQuery(artwork.imageUrl));
    }
    if (Array.isArray(artwork.galleryImages)) {
      for (const image of artwork.galleryImages) {
        if (typeof image === "string") {
          paths.add(splitPathAndQuery(image));
        }
      }
    }
  }
  return [...paths];
}

async function blobExists(pathname) {
  try {
    await head(pathname, { access: getBlobAccess() });
    return true;
  } catch {
    return false;
  }
}

async function loadArtworks() {
  if (process.env.DATABASE_URL) {
    let rows = [];
    await withPgClient(async (client) => {
      const result = await client.query(
        'SELECT data FROM "SiteContent" WHERE key = $1',
        ["artworks"],
      );
      if (result.rowCount > 0) {
        rows = result.rows[0].data;
      }
    });
    if (Array.isArray(rows) && rows.length > 0) {
      return rows;
    }
  }

  const filePath = path.join(process.cwd(), "src/data/artworks.json");
  return JSON.parse(readFileSync(filePath, "utf8"));
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for blob audit.");
  }

  const artworks = await loadArtworks();
  const paths = collectImagePaths(artworks);
  const missing = [];

  for (const pathname of paths) {
    const hasOriginal = await blobExists(pathname);
    const webpPath = pathname.replace(/\.(heic|heif|tiff|tif|bmp)$/i, ".webp");
    const hasWebp = webpPath !== pathname ? await blobExists(webpPath) : false;

    if (!hasOriginal && !hasWebp) {
      missing.push(pathname);
    }
  }

  console.log(`[audit] Checked ${paths.length} artwork image path(s).`);
  if (missing.length === 0) {
    console.log("[audit] All referenced images exist in Blob (original or WebP delivery copy).");
    return;
  }

  console.log(`[audit] Missing ${missing.length} object(s) in Blob:`);
  for (const entry of missing) {
    console.log(`  - ${entry}`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("[audit] failed:", error);
  process.exitCode = 1;
});
