import { SiteBrandName } from "@/components/ui/SiteBrandName";
import type { SiteConfig } from "@/types/site-config";
import { PRIMARY_NAV_LINKS } from "@/lib/nav-links";
import Link from "next/link";
import { AuthActions } from "./AuthActions";
import { GlobalSearch } from "./GlobalSearch";
import { HeaderActions } from "./HeaderActions";
import { MobileNav } from "./MobileNav";

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md transition-colors duration-300">
      <div className="site-container header-inner">
        <div className="header-leading">
          <div className="header-brand-group">
            <MobileNav />
            <Link href="/" className="site-logo">
              <SiteBrandName name={config.siteName} />
            </Link>
          </div>

          <nav aria-label="Primary" className="header-nav">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="header-actions">
          <GlobalSearch />
          <div className="header-actions-toolbar">
            <HeaderActions />
            <AuthActions />
          </div>
        </div>
      </div>
    </header>
  );
}
