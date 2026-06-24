const DEPRECATED_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export function normalizeDatabaseUrl(connectionString) {
  if (!connectionString?.trim()) {
    return connectionString;
  }

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();

    if (sslmode && DEPRECATED_SSL_MODES.has(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }

    return connectionString;
  } catch {
    return connectionString.replace(
      /([?&])sslmode=(prefer|require|verify-ca)(&|$)/gi,
      "$1sslmode=verify-full$3",
    );
  }
}

export function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  return normalizeDatabaseUrl(connectionString);
}
