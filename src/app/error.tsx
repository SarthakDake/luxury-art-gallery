"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="site-container page-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-serif text-3xl tracking-wide text-[var(--foreground)]">
        We could not load this page
      </h1>
      <p className="max-w-md body-text text-[var(--muted)]">
        Please try again. If the problem continues, contact the gallery.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="btn-primary btn-responsive" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn-secondary btn-responsive">
          Go home
        </Link>
      </div>
    </div>
  );
}
