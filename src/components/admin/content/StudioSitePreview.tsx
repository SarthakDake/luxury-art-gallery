"use client";

import { ArtworkDetailClient } from "@/app/art/[slug]/ArtworkDetailClient";
import { HomeSections } from "@/components/home/HomeSections";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
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

type PreviewTheme = "light" | "dark";
type StudioTab = "artworks" | "config" | "profile";

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

function previewMeta(activeTab: StudioTab, artwork: Artwork | null) {
  if (activeTab === "artworks") {
    return {
      title: "Artwork page",
      hint: artwork?.title?.trim()
        ? `Previewing “${artwork.title.trim()}” product page`
        : "Select an artwork to preview its product page",
    };
  }

  if (activeTab === "config") {
    return {
      title: "Site settings",
      hint: "Homepage, announcements, offers, and theme tokens",
    };
  }

  return {
    title: "Artist profile",
    hint: "About page — biography, portrait, exhibitions, press",
  };
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

function SiteSettingsPreview({
  config,
  artworks,
}: {
  config: SiteConfig;
  artworks: Artwork[];
}) {
  return (
    <div className="studio-preview-settings">
      {config.announcements.length > 0 ? <AnnouncementBar config={config} /> : null}
      <div className="studio-preview-settings-chrome">
        <span className="studio-preview-settings-brand">{config.siteName || "Site name"}</span>
        <span className="studio-preview-settings-nav">Shop · About · Contact</span>
      </div>
      <HomeSections config={config} artworks={artworks} />
    </div>
  );
}

function ArtworkPreviewEmpty() {
  return (
    <div className="studio-preview-empty">
      <p className="eyebrow">Artwork page</p>
      <p className="body-text">Choose an artwork on the left to preview its live product page.</p>
    </div>
  );
}

export function StudioSitePreview({
  config,
  artworks,
  profile,
  activeTab,
  selectedArtwork,
}: {
  config: SiteConfig;
  artworks: Artwork[];
  profile: ArtistProfile;
  activeTab: StudioTab;
  selectedArtwork: Artwork | null;
}) {
  const deferredConfig = useDeferredValue(config);
  const deferredArtworks = useDeferredValue(artworks);
  const deferredProfile = useDeferredValue(profile);
  const deferredArtwork = useDeferredValue(selectedArtwork);
  const [theme, setTheme] = useState<PreviewTheme>("light");

  const meta = previewMeta(activeTab, deferredArtwork);
  const brandStyle = useMemo(
    () => previewBrandStyle(deferredConfig.brand, theme),
    [deferredConfig.brand, theme],
  );

  return (
    <aside className="studio-preview" aria-label="Live website preview">
      <div className="studio-preview-header">
        <div>
          <p className="studio-preview-eyebrow">Preview</p>
          <h2 className="studio-preview-title">{meta.title}</h2>
        </div>
        <p className="studio-preview-hint">
          {meta.hint}
          <span className="studio-preview-hint-sep">·</span>
          Updates as you edit · not published until Save
        </p>
      </div>

      {activeTab === "config" ? (
        <div className="studio-preview-toolbar">
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
      ) : null}

      <div className="studio-preview-viewport">
        <div
          className={`studio-preview-canvas${theme === "dark" ? " dark" : ""}`}
          style={brandStyle}
          data-studio-preview
        >
          {activeTab === "artworks" ? (
            deferredArtwork ? (
              <div className="studio-preview-artwork">
                <ArtworkDetailClient
                  artwork={deferredArtwork}
                  artworks={deferredArtworks}
                  siteConfig={deferredConfig}
                />
              </div>
            ) : (
              <ArtworkPreviewEmpty />
            )
          ) : null}

          {activeTab === "config" ? (
            <SiteSettingsPreview config={deferredConfig} artworks={deferredArtworks} />
          ) : null}

          {activeTab === "profile" ? (
            <AboutPreview config={deferredConfig} profile={deferredProfile} />
          ) : null}
        </div>
      </div>
    </aside>
  );
}
