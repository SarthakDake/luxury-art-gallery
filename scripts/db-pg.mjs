import pg from "pg";

export async function withPgClient(run) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    return await run(client);
  } finally {
    await client.end();
  }
}
