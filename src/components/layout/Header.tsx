import config from "@/data/config.json";
import Link from "next/link";
import { GlobalSearch } from "./GlobalSearch";
import { HeaderActions } from "./HeaderActions";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md transition-colors duration-300">
      <div className="site-container flex h-[var(--header-height)] items-center justify-between gap-4">
        <div className="header-brand-group">
          <MobileNav />
          <Link
            href="/"
            className="site-logo truncate font-serif text-xl tracking-wide text-[var(--foreground)] transition-opacity duration-300 hover:opacity-75 lg:text-2xl"
          >
            {config.siteName}
          </Link>
        </div>

        <nav aria-label="Primary" className="header-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <GlobalSearch variant="inline" />
          <GlobalSearch variant="mobile" />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
