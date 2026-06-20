"use client";

import { MobileAuthActions } from "./AuthActions";
import { GlobalSearch } from "./GlobalSearch";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="mobile-nav">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((current) => !current)}
        className={`mobile-menu-btn ${open ? "mobile-menu-btn--open" : ""}`}
      >
        {open ? (
          <X className="mobile-menu-icon" strokeWidth={1.5} />
        ) : (
          <Menu className="mobile-menu-icon" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="mobile-nav-overlay"
            onClick={closeMenu}
          />
          <nav
            id="mobile-nav-panel"
            aria-label="Mobile primary"
            className="mobile-nav-panel"
          >
            <div className="site-container mobile-nav-inner">
              <ul className="mobile-nav-list">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={`mobile-nav-link ${
                          isActive ? "mobile-nav-link--active" : ""
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                <MobileAuthActions onNavigate={closeMenu} />
              </ul>

              <div className="mobile-nav-theme">
                <p className="eyebrow mb-4">Appearance</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={mounted ? isDark : false}
                  aria-label="Toggle dark mode"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="mobile-nav-theme-btn"
                >
                  <span className="mobile-nav-theme-icon" aria-hidden>
                    {!mounted ? (
                      <Sun className="h-4 w-4 opacity-0" strokeWidth={1.5} />
                    ) : isDark ? (
                      <Moon className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Sun className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </span>
                  <span>
                    {!mounted ? "Theme" : isDark ? "Dark mode" : "Light mode"}
                  </span>
                </button>
              </div>

              <div className="mobile-nav-search">
                <p className="eyebrow mb-4">Search</p>
                <GlobalSearch variant="drawer" />
              </div>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
