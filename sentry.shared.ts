export const sentryDsn =
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

export const sentryEnabled =
  Boolean(sentryDsn) && process.env.NODE_ENV === "production";

export const sentryEnvironment =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export const sentryTracesSampleRate = 0.1;
