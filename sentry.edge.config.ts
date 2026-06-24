import * as Sentry from "@sentry/nextjs";
import {
  sentryDsn,
  sentryEnabled,
  sentryEnvironment,
  sentryTracesSampleRate,
} from "./sentry.shared";

Sentry.init({
  dsn: sentryDsn,
  enabled: sentryEnabled,
  environment: sentryEnvironment,
  tracesSampleRate: sentryTracesSampleRate,
  sendDefaultPii: false,
});
