import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "../src/data/config.json" with { type: "json" };

function parseEmailList(value) {
  if (!value?.trim()) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(/[,;]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

const adminEmails = (() => {
  const combined = [
    ...parseEmailList(process.env.ADMIN_EMAIL),
    ...parseEmailList(config.adminEmail),
  ];

  const unique = [...new Set(combined)];
  return unique.length > 0
    ? unique
    : ["sarthaksdake@gmail.com", "colorsnjoybyaish@gmail.com"];
})();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  let promoted = 0;
  const missing = [];

  for (const adminEmail of adminEmails) {
    const result = await prisma.user.updateMany({
      where: {
        email: {
          equals: adminEmail,
          mode: "insensitive",
        },
      },
      data: {
        role: "ADMIN",
      },
    });

    if (result.count === 0) {
      missing.push(adminEmail);
    } else {
      promoted += result.count;
      console.log(`Promoted ${result.count} user(s) to ADMIN for ${adminEmail}.`);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `No user found for: ${missing.join(", ")}. Sign in once with Google for each account, then run this script again.`,
    );
  }

  if (promoted === 0) {
    process.exitCode = 1;
  } else {
    console.log(`Done. ${promoted} admin user(s) updated.`);
  }
} finally {
  await prisma.$disconnect();
}
