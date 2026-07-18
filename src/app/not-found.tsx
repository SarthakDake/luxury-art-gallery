import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-container page-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-serif text-3xl tracking-wide text-[var(--foreground)] md:text-4xl">
        Page not found
      </h1>
      <p className="max-w-md body-text text-[var(--muted)]">
        The page you are looking for may have moved or no longer exists.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className="btn-primary btn-responsive">
          Browse shop
        </Link>
        <Link href="/" className="btn-secondary btn-responsive">
          Go home
        </Link>
      </div>
    </div>
  );
}
