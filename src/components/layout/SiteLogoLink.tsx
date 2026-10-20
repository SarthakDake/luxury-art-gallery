"use client";

import { SiteBrandName } from "@/components/ui/SiteBrandName";
import { isPrimaryNavActive, scrollPrimaryNavToTop } from "@/lib/nav-links";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

export function SiteLogoLink({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const isHome = isPrimaryNavActive(pathname, "/");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isHome) {
      event.preventDefault();
      scrollPrimaryNavToTop(pathname);
    }
  }

  return (
    <Link href="/" className="site-logo" onClick={handleClick}>
      <SiteBrandName name={siteName} />
    </Link>
  );
}
