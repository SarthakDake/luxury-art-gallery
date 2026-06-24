import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { head } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const contentFiles = [
  { key: "artworks", file: "src/data/artworks.json", blobPath: "site-content/artworks.json" },
  { key: "config", file: "src/data/config.json", blobPath: "site-content/config.json" },
  { key: "profile", file: "src/data/profile.json", blobPath: "site-content/profile.json" },
] as const;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to sync site content from the database.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function writeContentFile(relativePath, data) {
  const filePath = path.join(process.cwd(), relativePath);
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function syncSiteContentFromDatabase() {
  const prisma = createPrisma();
  const mirrored = [];

  try {
    for (const entry of contentFiles) {
      const row = await prisma.siteContent.findUnique({
        where: { key: entry.key },
      });

      if (!row) {
        console.warn(`[sync] No database row for ${entry.key}, skipping.`);
        continue;
      }

      writeContentFile(entry.file, row.data);
      mirrored.push(entry.file);
      console.log(`[sync] Wrote ${entry.file} from database`);
    }

    if (mirrored.length === 0) {
      throw new Error("No site content rows found in the database.");
    }

    console.log(`[sync] Mirrored ${mirrored.length} file(s) from database.`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function syncSiteContentFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to sync site content from Blob.");
  }

  const mirrored = [];

  for (const entry of contentFiles) {
    try {
      const metadata = await head(entry.blobPath);
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
