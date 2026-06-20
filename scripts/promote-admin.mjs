import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adminEmail = (
  process.env.ADMIN_EMAIL ??
  process.env.CONTACT_EMAIL ??
  "sarthaksdake@gmail.com"
)
  .trim()
  .toLowerCase();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
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
    console.warn(
      `No user found for ${adminEmail}. Sign in once with Google, then run this script again.`,
    );
    process.exitCode = 1;
  } else {
    console.log(`Promoted ${result.count} user(s) to ADMIN for ${adminEmail}.`);
  }
} finally {
  await prisma.$disconnect();
}
