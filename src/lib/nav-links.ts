export const PRIMARY_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/signature-wall-art", label: "Signature Wall Art" },
  { href: "/shop", label: "Shop" },
  { href: "/for-interior-designers", label: "For Interior Designers" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
] as const;

/** True when the visitor is already on this primary nav destination (including nested routes). */
export function isPrimaryNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function scrollPrimaryNavToTop(pathname: string): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.location.hash) {
    window.history.replaceState(null, "", pathname);
  }

  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

export const FOOTER_EXPLORE_LINKS = [
  { href: "/signature-wall-art", label: "Signature Wall Art" },
  { href: "/shop", label: "Shop" },
  { href: "/for-interior-designers", label: "For Interior Designers" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/cart", label: "Cart" },
] as const;
