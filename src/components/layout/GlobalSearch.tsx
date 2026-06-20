"use client";

import artworks from "@/data/artworks.json";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/hooks/use-is-client";

interface GlobalSearchProps {
  variant?: "inline" | "mobile" | "drawer";
}

export function GlobalSearch({ variant = "inline" }: GlobalSearchProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return artworks.filter(
      (artwork) =>
        artwork.title.toLowerCase().includes(trimmed) ||
        artwork.material.toLowerCase().includes(trimmed),
    );
  }, [query]);

  useEffect(() => {
    if (variant === "mobile") return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  useEffect(() => {
    if (!mobileExpanded) return;

    if (inputRef.current) {
      inputRef.current.focus();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileExpanded]);

  function handleSelect(slug: string) {
    setQuery("");
    setIsOpen(false);
    setMobileExpanded(false);
    router.push(`/art/${slug}`, { scroll: false });
  }

  function closeMobileSearch() {
    setQuery("");
    setIsOpen(false);
    setMobileExpanded(false);
  }

  const resultsPanel =
    isOpen && query.trim() ? (
      <div className="search-results-panel">
        {results.length > 0 ? (
          <ul className="search-results-list max-h-72 overflow-y-auto py-1">
            {results.map((artwork) => (
              <li key={artwork.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(artwork.slug)}
                  className="flex w-full min-h-12 flex-col items-start justify-center gap-0.5 px-4 py-3 text-left transition-colors duration-300 hover:bg-[var(--surface)]"
                >
                  <span className="text-sm text-[var(--foreground)]">
                    {artwork.title}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {artwork.material}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-[var(--muted)]">No works found.</p>
        )}
      </div>
    ) : null;

  const searchInput = (
    <div className="search-input-wrap">
      <Search
        className="search-input-icon"
        strokeWidth={1.5}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search works"
        aria-label="Search artworks"
        className="input-field search-input"
      />
    </div>
  );

  if (variant === "drawer") {
    return (
      <div ref={containerRef} className="search-drawer">
        {searchInput}
        {resultsPanel}
      </div>
    );
  }

  if (variant === "mobile") {
    const mobilePanel =
      mobileExpanded && isClient ? (
        <>
          <button
            type="button"
            aria-label="Close search overlay"
            className="mobile-search-overlay"
            onClick={closeMobileSearch}
          />
          <div ref={containerRef} className="mobile-search-panel">
            <div className="site-container mobile-search-panel-inner">
              <div className="mobile-search-panel-row">
                {searchInput}
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeMobileSearch}
                  className="icon-btn mobile-search-close"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </div>
              {resultsPanel}
            </div>
          </div>
        </>
      ) : null;

    return (
      <>
        <button
          type="button"
          aria-label="Search artworks"
          aria-expanded={mobileExpanded}
          onClick={() => setMobileExpanded((expanded) => !expanded)}
          className="icon-btn xl:hidden"
        >
          {mobileExpanded ? (
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          ) : (
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          )}
        </button>

        {isClient && mobilePanel ? createPortal(mobilePanel, document.body) : null}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full max-w-[200px] xl:block"
    >
      {searchInput}
      {isOpen && query.trim() ? (
        <div className="search-dropdown">{resultsPanel}</div>
      ) : null}
    </div>
  );
}
