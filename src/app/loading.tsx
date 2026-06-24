export default function Loading() {
  return (
    <div className="site-container page-shell py-16" aria-live="polite" aria-busy="true">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface)]" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-[var(--surface)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--surface)]" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--surface)]" />
      </div>
    </div>
  );
}
