"use client";

import {
  isPrimaryNavActive,
  scrollPrimaryNavToTop,
} from "@/lib/nav-links";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

export function PrimaryNavLink({
  href,
  children,
  className,
  activeClassName,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = isPrimaryNavActive(pathname, href);
  const mergedClassName = [className, isActive && activeClassName]
    .filter(Boolean)
    .join(" ");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isActive) {
      event.preventDefault();
      scrollPrimaryNavToTop(pathname);
    }

    onNavigate?.();
  }

  return (
    <Link
      href={href}
      className={mergedClassName || undefined}
      aria-current={isActive ? "page" : undefined}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
