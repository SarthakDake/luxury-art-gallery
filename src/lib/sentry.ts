import * as Sentry from "@sentry/nextjs";
import { sentryEnabled } from "../../sentry.shared";

export function captureServerError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("details", context);
    }

    Sentry.captureException(error);
  });
}
