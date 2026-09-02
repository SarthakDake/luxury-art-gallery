// Reads/writes the SiteContent table in Postgres, which is the source of truth
// for Content Studio data once a DATABASE_URL is configured. When there is no
// database (e.g. a fresh local checkout), callers fall back to the bundled
// JSON files in src/data/ via the `fallback` argument passed to loadSiteContent.
import "server-only";

import { mirrorContentSnapshot, type ContentMirrorResult } from "@/lib/content-json-mirror";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  SITE_CONTENT_KEYS,
  type SiteContentKey,
  writeContentFile,
} from "@/lib/site-data/files";

const CONTENT_KEYS = Object.values(SITE_CONTENT_KEYS);

async function readFromDatabase(key: SiteContentKey): Promise<unknown | null> {
  // No DATABASE_URL means this environment intentionally runs off the JSON
  // files (e.g. local dev without Postgres) — treat it as "no row" rather
  // than an error so callers fall through to their file-based fallback.
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    return row?.data ?? null;
  } catch (error) {
    console.error(`[site-data] database read failed for ${key}:`, error);
    return null;
  }
}

async function writeToDatabase(key: SiteContentKey, data: unknown): Promise<void> {
  // Mirrors the same guard as readFromDatabase: without a database configured,
  // writes silently no-op and persistence relies entirely on mirrorContentSnapshot
  // (blob/filesystem/GitHub) instead.
  if (!process.env.DATABASE_URL) {
    return;
  }

  await prisma.siteContent.upsert({
    where: { key },
    create: {
      key,
      data: data as Prisma.InputJsonValue,
    },
    update: {
      data: data as Prisma.InputJsonValue,
    },
  });
}

// Database row wins if present; otherwise the caller's fallback (bundled JSON
// file) is used. This means a production DB row is never silently overwritten
// by seed data — the fallback only ever fills a gap, it doesn't compete with it.
export async function loadSiteContent<T>(key: SiteContentKey, fallback: () => T): Promise<T> {
  const fromDatabase = await readFromDatabase(key);

  if (fromDatabase !== null) {
    return fromDatabase as T;
  }

  return fallback();
}

// Writes go to the database first (if configured), then fan out to every
// configured mirror (local file, Vercel Blob, GitHub) so the JSON snapshots
// stay in sync with whatever Content Studio just saved.
export async function persistSiteContent(
  key: SiteContentKey,
  data: unknown,
): Promise<ContentMirrorResult[]> {
  if (process.env.DATABASE_URL) {
    await writeToDatabase(key, data);
  }

  return mirrorContentSnapshot(key, data);
}

// Re-exports every database row to all mirrors — used for one-off admin/repair
// tasks (e.g. after restoring a DB backup) rather than on the normal save path.
export async function mirrorAllContentFromDatabase(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to mirror site content from the database.");
  }

  const mirrored: string[] = [];

  for (const key of CONTENT_KEYS) {
    const data = await readFromDatabase(key);

    if (data === null) {
      console.warn(`[site-data] skipping ${key}: no row in database`);
      continue;
    }

    // Vercel's serverless filesystem is read-only outside of /tmp, so writing
    // the JSON file back is only meaningful (and only possible) locally.
    if (process.env.VERCEL !== "1") {
      writeContentFile(key, data);
    }

    await mirrorContentSnapshot(key, data);
    mirrored.push(key);
  }

  return mirrored;
}

export { SITE_CONTENT_KEYS };
