"use client";

import { ArtworkDetailClient } from "@/app/art/[slug]/ArtworkDetailClient";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedWorksSection } from "@/components/home/FeaturedWorksSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OffersSection } from "@/components/home/OffersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBadgesSection } from "@/components/home/TrustBadgesSection";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { RichText } from "@/components/ui/RichText";
import { brandTokensToCssVars } from "@/lib/site-config/brand-style";
import type { Artwork } from "@/types/artwork";
import type { ArtistProfile, SiteConfig } from "@/types/site-config";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { StudioPreviewTarget } from "./preview-targets";

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

function PreviewRegion({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-preview-region={id}
      className={`studio-preview-region${active ? " is-preview-focus" : ""}`}
    >
      {children}
    </div>
  );
}

function AboutPreview({
  config,
  profile,
  focus,
}: {
  config: SiteConfig;
  profile: ArtistProfile;
  focus: "identity" | "exhibitions" | "press";
}) {
  const exhibitions = [...profile.exhibitions]
    .sort((a, b) => b.year - a.year)
    .slice(0, 6);
  const press = profile.press.slice(0, 4);

  return (
    <div className="studio-preview-about">
      <PreviewRegion id="identity" active={focus === "identity"}>
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

        {(profile.highlights ?? []).length > 0 ? (
          <div className="about-highlights studio-preview-about-highlights">
            {(profile.highlights ?? []).map((highlight) => (
              <div
                key={`${highlight.label}-${highlight.value}`}
                className="about-highlight-item"
              >
                <p className="about-highlight-value">{highlight.value}</p>
                <p className="about-highlight-label">{highlight.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </PreviewRegion>

      <PreviewRegion id="exhibitions" active={focus === "exhibitions"}>
        <section className="studio-preview-about-section">
          <p className="eyebrow">Exhibitions</p>
          {exhibitions.length > 0 ? (
            <ul>
              {exhibitions.map((item) => (
                <li key={`${item.title}-${item.year}`}>
                  <strong>{item.year}</strong> — {item.title}
                  {item.location ? `, ${item.location}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="body-text">Exhibition history will appear here.</p>
          )}
        </section>
      </PreviewRegion>

      <PreviewRegion id="press" active={focus === "press"}>
        <section className="studio-preview-about-section">
          <p className="eyebrow">Press</p>
          {press.length > 0 ? (
            <ul>
              {press.map((item) => (
                <li key={`${item.publication}-${item.year}`}>
                  {item.publication} ({item.year})
                </li>
              ))}
            </ul>
          ) : (
            <p className="body-text">Press features will appear here.</p>
          )}
        </section>
      </PreviewRegion>
    </div>
  );
}

function SiteChrome({ config }: { config: SiteConfig }) {
  return (
    <div className="studio-preview-settings-chrome">
      <span className="studio-preview-settings-brand">{config.siteName || "Site name"}</span>
      <span className="studio-preview-settings-nav">Shop · About · Contact</span>
    </div>
  );
}

function SiteSettingsPreview({
  config,
  artworks,
  region,
}: {
  config: SiteConfig;
  artworks: Artwork[];
  region: Extract<StudioPreviewTarget, { scope: "site" }>["region"];
}) {
  const showAnnouncements = region === "announcements" || region === "theme" || region === "homepage";
  const showChrome =
    region === "hero" ||
    region === "announcements" ||
    region === "footer" ||
    region === "theme" ||
    region === "homepage";

  return (
    <div className="studio-preview-settings">
      {showAnnouncements ? (
        <PreviewRegion id="announcements" active={region === "announcements"}>
          {config.announcements.length > 0 ? (
            <AnnouncementBar config={config} />
          ) : (
            <div className="studio-preview-empty-inline">No announcement lines yet.</div>
          )}
        </PreviewRegion>
      ) : null}

      {showChrome ? (
        <PreviewRegion id="footer-chrome" active={region === "footer"}>
          <SiteChrome config={config} />
          {region === "footer" ? (
            <div className="studio-preview-footer-mock">
              <p className="body-text">{config.studioAddress || "Studio address"}</p>
              <p className="studio-field-hint">
                {config.contactEmail || "Contact email"}
                {config.whatsappNumber ? ` · ${config.whatsappNumber}` : ""}
              </p>
              <p className="studio-field-hint">
                Social:{" "}
                {Object.entries(config.socialLinks)
                  .filter(([, value]) => value.trim())
                  .map(([key]) => key)
                  .join(", ") || "none set"}
              </p>
              <p className="studio-field-hint">
                Visitor counter: {config.visitorCounter.eyebrow || "Visitors"} ·{" "}
                {config.visitorCounter.singularLabel}/{config.visitorCounter.pluralLabel}
              </p>
            </div>
          ) : null}
        </PreviewRegion>
      ) : null}

      {region === "hero" || region === "theme" || region === "homepage" ? (
        <PreviewRegion id="hero" active={region === "hero" || region === "theme"}>
          <HeroSection config={config} />
        </PreviewRegion>
      ) : null}

      {region === "announcements" || region === "homepage" ? (
        <PreviewRegion id="trust" active={region === "announcements"}>
          <TrustBadgesSection config={config} />
        </PreviewRegion>
      ) : null}

      {region === "homepage" || region === "theme" ? (
        <>
          <PreviewRegion id="collections" active={false}>
            <CollectionsSection config={config} artworks={artworks} />
          </PreviewRegion>
          <PreviewRegion id="featured" active={false}>
            <FeaturedWorksSection config={config} artworks={artworks} />
          </PreviewRegion>
        </>
      ) : null}

      {region === "promotions" || region === "homepage" || region === "theme" ? (
        <>
          <PreviewRegion id="offers" active={region === "promotions"}>
            <OffersSection config={config} />
          </PreviewRegion>
          <PreviewRegion id="features" active={region === "promotions"}>
            <FeaturesSection config={config} />
          </PreviewRegion>
        </>
      ) : null}

      {region === "testimonials" || region === "homepage" || region === "theme" ? (
        <PreviewRegion id="testimonials" active={region === "testimonials"}>
          <TestimonialsSection config={config} />
        </PreviewRegion>
      ) : null}
    </div>
  );
}

export function StudioSitePreview({
  config,
  artworks,
  profile,
  selectedArtwork,
  activePreview,
  onClose,
}: {
  config: SiteConfig;
  artworks: Artwork[];
  profile: ArtistProfile;
  selectedArtwork: Artwork | null;
  activePreview: StudioPreviewTarget | null;
  onClose: () => void;
}) {
  const deferredConfig = useDeferredValue(config);
  const deferredArtworks = useDeferredValue(artworks);
  const deferredProfile = useDeferredValue(profile);
  const deferredArtwork = useDeferredValue(selectedArtwork);
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const viewportRef = useRef<HTMLDivElement>(null);

  const brandStyle = useMemo(
    () => previewBrandStyle(deferredConfig.brand, theme),
    [deferredConfig.brand, theme],
  );

  useEffect(() => {
    if (!activePreview) {
      return;
    }

    const root = viewportRef.current;
    if (!root) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const focused = root.querySelector(".is-preview-focus");
      focused?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activePreview]);

  const showThemeToggle =
    activePreview?.scope === "site" &&
    (activePreview.region === "theme" || activePreview.region === "homepage");

  return (
    <aside className="studio-preview" aria-label="Section website preview">
      <div className="studio-preview-header">
        <div>
          <p className="studio-preview-eyebrow">Preview</p>
          <h2 className="studio-preview-title">
            {activePreview ? activePreview.label : "Section preview"}
          </h2>
        </div>
        <p className="studio-preview-hint">
          {activePreview
            ? "Showing your unsaved edits for this section · not published until Save"
            : "Click Preview on any editor section to see that exact place on the site"}
        </p>
      </div>

      {activePreview ? (
        <div className="studio-preview-toolbar">
          {showThemeToggle ? (
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
          ) : (
            <span className="studio-preview-toolbar-spacer" />
          )}
          <button type="button" className="btn-text studio-preview-close" onClick={onClose}>
            Close
          </button>
        </div>
      ) : null}

      <div className="studio-preview-viewport" ref={viewportRef}>
        {!activePreview ? (
          <div className="studio-preview-idle">
            <p className="eyebrow">Ready when you are</p>
            <p className="body-text">
              Use the Preview button on Details, Photos, Brand tokens, Artist identity, and other
              sections to open a live view of that exact spot with your current changes.
            </p>
          </div>
        ) : (
          <div
            className={`studio-preview-canvas${theme === "dark" ? " dark" : ""}`}
            style={brandStyle}
            data-studio-preview
          >
            {activePreview.scope === "artwork" ? (
              deferredArtwork ? (
                <div className="studio-preview-artwork">
                  <div className="studio-preview-focus-banner">
                    Previewing: {activePreview.label}
                  </div>
                  <ArtworkDetailClient
                    artwork={deferredArtwork}
                    artworks={deferredArtworks}
                    siteConfig={deferredConfig}
                  />
                </div>
              ) : (
                <div className="studio-preview-empty">
                  <p className="eyebrow">Artwork page</p>
                  <p className="body-text">Select an artwork first, then click Preview.</p>
                </div>
              )
            ) : null}

            {activePreview.scope === "site" && activePreview.region === "product-copy" ? (
              deferredArtwork || deferredArtworks[0] ? (
                <div className="studio-preview-artwork">
                  <div className="studio-preview-focus-banner">
                    Previewing default product copy on a product page
                  </div>
                  <ArtworkDetailClient
                    artwork={deferredArtwork ?? deferredArtworks[0]}
                    artworks={deferredArtworks}
                    siteConfig={deferredConfig}
                  />
                </div>
              ) : (
                <div className="studio-preview-empty">
                  <p className="body-text">Add an artwork to preview product-page defaults.</p>
                </div>
              )
            ) : null}

            {activePreview.scope === "site" && activePreview.region !== "product-copy" ? (
              <SiteSettingsPreview
                config={deferredConfig}
                artworks={deferredArtworks}
                region={activePreview.region}
              />
            ) : null}

            {activePreview.scope === "about" ? (
              <AboutPreview
                config={deferredConfig}
                profile={deferredProfile}
                focus={activePreview.region}
              />
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
