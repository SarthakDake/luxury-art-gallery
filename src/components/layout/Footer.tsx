import { ContactEmailLinks } from "@/components/ui/ContactEmailLinks";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { VisitorCounter } from "@/components/ui/VisitorCounter";
import type { SiteConfig } from "@/types/site-config";
import { MapPin } from "lucide-react";
import Link from "next/link";

const exploreLinks = [
  { href: "/shop", label: "Gallery" },
  { href: "/about", label: "About the Artist" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Cart" },
] as const;

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer className="site-footer">
      <div className="site-container footer-main">
        <div className="footer-grid" data-reveal-stagger>
          <div className="footer-brand" data-reveal="slide-up">
            <Link href="/" className="footer-brand-name">
              {config.siteName}
            </Link>
            <p className="footer-brand-tagline">{config.heroSubtitle}</p>
          </div>

          <nav
            className="footer-column"
            aria-label="Footer navigation"
            data-reveal="slide-up"
          >
            <h2 className="footer-heading">Explore</h2>
            <ul className="footer-nav">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-column" data-reveal="slide-up">
            <h2 className="footer-heading">Contact</h2>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin
                  className="footer-contact-icon"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span>{config.studioAddress}</span>
              </li>
              <ContactEmailLinks
                asItems
                linkClassName="footer-contact-link"
                iconClassName="footer-contact-icon"
              />
            </ul>
          </div>

          <div className="footer-column footer-social-column" data-reveal="slide-up">
            <SocialLinks />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="site-container footer-bottom-inner">
          <div className="footer-meta-bar">
            <p className="footer-copyright">
              © {new Date().getFullYear()} {config.siteName}. All rights
              reserved.
            </p>

            <span className="footer-meta-divider" aria-hidden />

            <VisitorCounter />

            <span className="footer-meta-divider" aria-hidden />

            <p className="footer-note">Original works — Worldwide shipping</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
