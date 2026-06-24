import config from "../src/data/config.json" with { type: "json" };
import { withPgClient } from "./db-pg.mjs";

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

try {
  let promoted = 0;
  const missing = [];

  await withPgClient(async (client) => {
    for (const adminEmail of adminEmails) {
      const result = await client.query(
        `UPDATE "User"
         SET role = 'ADMIN'::"UserRole", "updatedAt" = NOW()
         WHERE LOWER(email) = LOWER($1)`,
        [adminEmail],
      );

      if (result.rowCount === 0) {
        missing.push(adminEmail);
      } else {
        promoted += result.rowCount;
        console.log(`Promoted ${result.rowCount} user(s) to ADMIN for ${adminEmail}.`);
      }
    }
  });

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
} catch (error) {
  console.error("Failed to promote admin users:", error);
  process.exit(1);
}
