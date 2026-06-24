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

export async function loadSiteContent<T>(key: SiteContentKey, fallback: () => T): Promise<T> {
  const fromDatabase = await readFromDatabase(key);

  if (fromDatabase !== null) {
    return fromDatabase as T;
  }

  return fallback();
}

export async function persistSiteContent(
  key: SiteContentKey,
  data: unknown,
): Promise<ContentMirrorResult[]> {
  if (process.env.DATABASE_URL) {
    await writeToDatabase(key, data);
  }

  return mirrorContentSnapshot(key, data);
}

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

    if (process.env.VERCEL !== "1") {
      writeContentFile(key, data);
    }

    await mirrorContentSnapshot(key, data);
    mirrored.push(key);
  }

  return mirrored;
}

export { SITE_CONTENT_KEYS };
