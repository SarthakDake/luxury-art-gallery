import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const VISITOR_COUNT_KEY = "visitor_count";
const COUNT_FILE = path.join(process.cwd(), "data/visitor-count.json");
const MAX_COUNT = 999_999_999;

interface VisitorCountData {
  count: number;
}

async function readLegacyFileCount(): Promise<number> {
  try {
    const raw = await fs.readFile(COUNT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as VisitorCountData;

    return Number.isFinite(parsed.count)
      ? Math.max(0, Math.floor(parsed.count))
      : 0;
  } catch {
    return 0;
  }
}

async function ensureVisitorMetricSeeded(): Promise<number> {
  const existing = await prisma.siteMetric.findUnique({
    where: { key: VISITOR_COUNT_KEY },
  });

  if (existing) {
    return existing.value;
  }

  const legacyCount = await readLegacyFileCount();

  const created = await prisma.siteMetric.create({
    data: {
      key: VISITOR_COUNT_KEY,
      value: legacyCount,
    },
  });

  return created.value;
}

export async function getVisitorCount(): Promise<number> {
  const metric = await prisma.siteMetric.findUnique({
    where: { key: VISITOR_COUNT_KEY },
  });

  if (metric) {
    return metric.value;
  }

  return ensureVisitorMetricSeeded();
}

export async function incrementVisitorCount(): Promise<number> {
  await ensureVisitorMetricSeeded();

  const metric = await prisma.siteMetric.update({
    where: { key: VISITOR_COUNT_KEY },
    data: {
      value: {
        increment: 1,
      },
    },
  });

  return Math.min(metric.value, MAX_COUNT);
}
