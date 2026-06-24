import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const seeds = [
  { key: "artworks", file: "src/data/artworks.json" },
  { key: "config", file: "src/data/config.json" },
  { key: "profile", file: "src/data/profile.json" },
] as const;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed site content.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export async function seedSiteContent() {
  const prisma = createPrisma();

  try {
    for (const seed of seeds) {
      const existing = await prisma.siteContent.findUnique({
        where: { key: seed.key },
      });

      if (existing) {
        console.log(`[seed] Site content already exists: ${seed.key}`);
        continue;
      }

      const filePath = path.join(process.cwd(), seed.file);
      const data = JSON.parse(readFileSync(filePath, "utf8"));

      await prisma.siteContent.create({
        data: {
          key: seed.key,
          data,
        },
      });

      console.log(`[seed] Created site content: ${seed.key}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedSiteContent().catch((error) => {
    console.error("[seed] Failed to seed site content:", error);
    process.exit(1);
  });
}
