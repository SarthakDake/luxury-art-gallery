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

const MOBILE_SEARCH_TOP =
  "top-[calc(var(--announcement-height)+var(--header-height))]";

export function GlobalSearch({ variant = "inline" }: GlobalSearchProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const hasQuery = query.length > 0;

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
    if (variant !== "mobile" || !mobileExpanded) return;

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPosition = style.position;
    const previousTop = style.top;
    const previousWidth = style.width;

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";

    return () => {
      cancelAnimationFrame(frame);
      style.overflow = previousOverflow;
      style.position = previousPosition;
      style.top = previousTop;
      style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [variant, mobileExpanded]);

  function handleSelect(slug: string) {
    setQuery("");
    setIsOpen(false);
    setMobileExpanded(false);
    router.push(`/art/${slug}`, { scroll: false });
  }

  function openMobileSearch() {
    window.scrollTo(0, 0);
    setMobileExpanded(true);
  }

  function closeMobileSearch() {
    setQuery("");
    setIsOpen(false);
    setMobileExpanded(false);
  }

  function clearQuery() {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus({ preventScroll: true });
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
    <div
      className={`search-input-wrap${hasQuery ? " search-input-wrap--has-value" : ""}`}
    >
      <span className="search-input-leading" aria-hidden="true">
        <Search className="search-input-icon" strokeWidth={1.5} />
      </span>

      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search works"
        aria-label="Search artworks"
        className="search-input"
      />

      <button
        type="button"
        aria-label="Clear search"
        className="search-input-clear"
        onMouseDown={(event) => event.preventDefault()}
        onClick={clearQuery}
        tabIndex={hasQuery ? 0 : -1}
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
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
            onClick={closeMobileSearch}
            className={`fixed inset-x-0 bottom-0 ${MOBILE_SEARCH_TOP} z-[44] cursor-pointer border-0 bg-black/30 backdrop-blur-[2px]`}
          />
          <div
            ref={containerRef}
            className={`fixed inset-x-0 ${MOBILE_SEARCH_TOP} z-[45] border-b border-[var(--border)] bg-[var(--background)] shadow-[0_12px_32px_rgba(0,0,0,0.08)]`}
          >
            <div className="site-container py-3.5">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">{searchInput}</div>
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeMobileSearch}
                  className="icon-btn shrink-0"
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
          onClick={() =>
            mobileExpanded ? closeMobileSearch() : openMobileSearch()
          }
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
    <div ref={containerRef} className="header-search hidden xl:block">
      {searchInput}
      {isOpen && query.trim() ? (
        <div className="search-dropdown">{resultsPanel}</div>
      ) : null}
    </div>
  );
}
