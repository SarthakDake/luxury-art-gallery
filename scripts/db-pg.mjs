import pg from "pg";
import { getDatabaseUrl } from "./pg-connection.mjs";

export async function withPgClient(run) {
  const client = new pg.Client({ connectionString: getDatabaseUrl() });
  await client.connect();

  try {
    return await run(client);
  } finally {
    await client.end();
  }
}
