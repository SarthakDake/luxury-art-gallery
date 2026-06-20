import fs from "fs/promises";
import path from "path";

const COUNT_FILE = path.join(process.cwd(), "data/visitor-count.json");

interface VisitorCountData {
  count: number;
}

async function ensureCountFile(): Promise<void> {
  try {
    await fs.access(COUNT_FILE);
  } catch {
    await fs.mkdir(path.dirname(COUNT_FILE), { recursive: true });
    await fs.writeFile(COUNT_FILE, JSON.stringify({ count: 0 }, null, 2));
  }
}

async function readCountFile(): Promise<VisitorCountData> {
  await ensureCountFile();
  const raw = await fs.readFile(COUNT_FILE, "utf-8");
  const parsed = JSON.parse(raw) as VisitorCountData;

  return {
    count: Number.isFinite(parsed.count) ? Math.max(0, Math.floor(parsed.count)) : 0,
  };
}

export async function getVisitorCount(): Promise<number> {
  const data = await readCountFile();
  return data.count;
}

export async function incrementVisitorCount(): Promise<number> {
  const data = await readCountFile();
  const nextCount = Math.min(data.count + 1, 999_999_999);

  await fs.writeFile(
    COUNT_FILE,
    JSON.stringify({ count: nextCount }, null, 2),
    "utf-8",
  );

  return nextCount;
}
