"use client";

import artworks from "@/data/artworks.json";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface GlobalSearchProps {
  variant?: "inline" | "mobile" | "drawer";
}

export function GlobalSearch({ variant = "inline" }: GlobalSearchProps) {
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
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (variant === "mobile") {
          setMobileExpanded(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  useEffect(() => {
    if (mobileExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobileExpanded]);

  function handleSelect(slug: string) {
    setQuery("");
    setIsOpen(false);
    setMobileExpanded(false);
    router.push(`/art/${slug}`, { scroll: false });
  }

  const resultsPanel =
    isOpen && query.trim() ? (
      <div className="mt-2 border border-[var(--border)] bg-[var(--background)] shadow-lg">
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
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
        strokeWidth={1.5}
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
        className="input-field pl-10 text-sm"
      />
    </div>
  );

  if (variant === "drawer") {
    return (
      <div ref={containerRef} className="relative w-full">
        {searchInput}
        {resultsPanel}
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div ref={containerRef} className="relative md:hidden">
        <button
          type="button"
          aria-label="Search artworks"
          aria-expanded={mobileExpanded}
          onClick={() => setMobileExpanded((expanded) => !expanded)}
          className="icon-btn"
        >
          {mobileExpanded ? (
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          ) : (
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          )}
        </button>

        {mobileExpanded && (
          <div className="search-dropdown">
            {searchInput}
            {resultsPanel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full max-w-[220px] md:block"
    >
      {searchInput}
      {isOpen && query.trim() && (
        <div className="search-dropdown">
          {resultsPanel}
        </div>
      )}
    </div>
  );
}
