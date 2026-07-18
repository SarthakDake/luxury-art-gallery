"use client";

import { HomeSections } from "@/components/home/HomeSections";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { RichText } from "@/components/ui/RichText";
import { brandTokensToCssVars } from "@/lib/site-config/brand-style";
import type { Artwork } from "@/types/artwork";
import type { ArtistProfile, SiteConfig } from "@/types/site-config";
import {
  useDeferredValue,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

type PreviewPage = "home" | "about";
type PreviewTheme = "light" | "dark";

function previewBrandStyle(brand: SiteConfig["brand"], theme: PreviewTheme): CSSProperties {
  const vars = brandTokensToCssVars(brand);
  const isDark = theme === "dark";

  return {
    ...vars,
    "--background": isDark ? brand.darkBackground : brand.background,
    "--foreground": isDark ? brand.darkForeground : brand.foreground,
    "--muted": isDark ? brand.darkMuted : brand.muted,
    "--border": isDark ? brand.darkBorder : brand.border,
    "--surface": isDark ? brand.darkSurface : brand.surface,
    "--surface-elevated": isDark
      ? `color-mix(in srgb, ${brand.darkSurface} 70%, #ffffff)`
      : brand.background,
    "--accent": isDark ? brand.darkAccent : brand.accent,
    "--accent-foreground": isDark ? "#171717" : brand.accentForeground,
    color: isDark ? brand.darkForeground : brand.foreground,
    background: isDark ? brand.darkBackground : brand.background,
  } as CSSProperties;
}

function AboutPreview({
  config,
  profile,
}: {
  config: SiteConfig;
  profile: ArtistProfile;
}) {
  const exhibitions = [...profile.exhibitions]
    .sort((a, b) => b.year - a.year)
    .slice(0, 4);
  const press = profile.press.slice(0, 3);

  return (
    <div className="studio-preview-about">
      <header className="studio-preview-about-intro">
        <p className="eyebrow">About the Artist</p>
        <h1 className="page-title">{profile.artistName || "Artist name"}</h1>
        <p className="body-text">
          {profile.artistTagline || "Artist tagline will appear here."}
        </p>
      </header>

      <div className="studio-preview-about-grid">
        <div className="art-image-frame studio-preview-about-portrait">
          {profile.portraitImageUrl ? (
            <ArtworkImage
              src={profile.portraitImageUrl}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          ) : (
            <div className="studio-preview-about-portrait-empty">Portrait</div>
          )}
        </div>
        <div className="studio-preview-about-copy">
          {profile.biography ? (
            <RichText content={profile.biography} className="about-bio-rich" />
          ) : (
            <p className="body-text">Biography will appear here.</p>
          )}
          <div className="about-studio-note">
            <p className="eyebrow">Studio</p>
            <p className="body-text text-[var(--foreground)]">
              {config.studioAddress || "Studio address"}
            </p>
          </div>
        </div>
      </div>

      {exhibitions.length > 0 ? (
        <section className="studio-preview-about-section">
          <p className="eyebrow">Exhibitions</p>
          <ul>
            {exhibitions.map((item) => (
              <li key={`${item.title}-${item.year}`}>
                <strong>{item.year}</strong> — {item.title}
                {item.location ? `, ${item.location}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {press.length > 0 ? (
        <section className="studio-preview-about-section">
          <p className="eyebrow">Press</p>
          <ul>
            {press.map((item) => (
              <li key={`${item.publication}-${item.year}`}>
                {item.publication} ({item.year})
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function StudioSitePreview({
  config,
  artworks,
  profile,
  activeTab,
}: {
  config: SiteConfig;
  artworks: Artwork[];
  profile: ArtistProfile;
  activeTab: string;
}) {
  const deferredConfig = useDeferredValue(config);
  const deferredArtworks = useDeferredValue(artworks);
  const deferredProfile = useDeferredValue(profile);

  const defaultPage: PreviewPage = activeTab === "profile" ? "about" : "home";
  const [page, setPage] = useState<PreviewPage>(defaultPage);
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [pageTouched, setPageTouched] = useState(false);

  const resolvedPage = pageTouched ? page : defaultPage;
  const brandStyle = useMemo(
    () => previewBrandStyle(deferredConfig.brand, theme),
    [deferredConfig.brand, theme],
  );

  return (
    <aside className="studio-preview" aria-label="Live website preview">
      <div className="studio-preview-header">
        <div>
          <p className="studio-preview-eyebrow">Preview</p>
          <h2 className="studio-preview-title">Live website</h2>
        </div>
        <p className="studio-preview-hint">Updates as you edit · not published until Save</p>
      </div>

      <div className="studio-preview-toolbar">
        <div className="studio-preview-seg" role="group" aria-label="Preview page">
          <button
            type="button"
            className={resolvedPage === "home" ? "is-active" : undefined}
            onClick={() => {
              setPage("home");
              setPageTouched(true);
            }}
          >
            Home
          </button>
          <button
            type="button"
            className={resolvedPage === "about" ? "is-active" : undefined}
            onClick={() => {
              setPage("about");
              setPageTouched(true);
            }}
          >
            About
          </button>
        </div>
        <div className="studio-preview-seg" role="group" aria-label="Preview theme">
          <button
            type="button"
            className={theme === "light" ? "is-active" : undefined}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            type="button"
            className={theme === "dark" ? "is-active" : undefined}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="studio-preview-viewport">
        <div
          className={`studio-preview-canvas${theme === "dark" ? " dark" : ""}`}
          style={brandStyle}
          data-studio-preview
        >
          {resolvedPage === "home" ? (
            <HomeSections config={deferredConfig} artworks={deferredArtworks} />
          ) : (
            <AboutPreview config={deferredConfig} profile={deferredProfile} />
          )}
        </div>
      </div>
    </aside>
  );
}
