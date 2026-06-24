import Link from "next/link";

export default function ArtworkNotFoundPage() {
  return (
    <div className="site-container page-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="eyebrow">Artwork not found</p>
      <h1 className="font-serif text-3xl tracking-wide text-[var(--foreground)] md:text-4xl">
        This piece is not in the gallery
      </h1>
      <p className="max-w-md body-text text-[var(--muted)]">
        It may have been removed or the link may be outdated.
      </p>
      <Link href="/shop" className="btn-primary btn-responsive">
        Return to gallery
      </Link>
    </div>
  );
}
