"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const node = contentRef.current;
    if (!node) return;

    node.classList.remove("page-enter");
    void node.offsetWidth;
    node.classList.add("page-enter");
  }, [pathname]);

  return <div ref={contentRef}>{children}</div>;
}
