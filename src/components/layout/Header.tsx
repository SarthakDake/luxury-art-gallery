import type { PublicSiteConfig } from "@/lib/site-config";
import { PRIMARY_NAV_LINKS } from "@/lib/nav-links";
import { AuthActions } from "./AuthActions";
import { GlobalSearch } from "./GlobalSearch";
import { HeaderActions } from "./HeaderActions";
import { MobileNav } from "./MobileNav";
import { PrimaryNavLink } from "./PrimaryNavLink";
import { SiteLogoLink } from "./SiteLogoLink";

export function Header({ config }: { config: PublicSiteConfig }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md transition-colors duration-300">
      <div className="site-container header-inner">
        <div className="header-leading">
          <div className="header-brand-group">
            <MobileNav />
            <SiteLogoLink siteName={config.siteName} />
          </div>

          <nav aria-label="Primary" className="header-nav">
            {PRIMARY_NAV_LINKS.map((link) => (
              <PrimaryNavLink key={link.href} href={link.href} className="nav-link">
                {link.label}
              </PrimaryNavLink>
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
