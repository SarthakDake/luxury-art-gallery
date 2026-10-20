"use client";

import {
  ImageUploadField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioSection,
} from "./shared";
import { SITE_SEO_PAGE_KEYS } from "@/lib/site-config/defaults";
import type { SiteConfig, SiteSeoPageKey } from "@/types/site-config";

const SEO_PAGE_LABELS: Record<SiteSeoPageKey, string> = {
  home: "Homepage",
  shop: "Shop",
  about: "About us",
  contact: "Contact us",
  signatureWallArt: "Signature Wall Art",
  forInteriorDesigners: "For Interior Designers",
  returnPolicy: "Return & refund policy",
};

export function ConfigSeoSection({
  config,
  onChange,
  onPreview,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onPreview: () => void;
}) {
  return (
    <StudioSection
      title="Search & social (SEO)"
      subtitle="Google & previews"
      defaultOpen={false}
      onPreview={onPreview}
    >
      <StudioGroup
        eyebrow="Defaults"
        title="Site-wide search metadata"
        description="Used in Google results and when a page does not set its own description. Keep descriptions under ~160 characters when possible."
      >
        <StudioField label="Default meta description" fullWidth>
          <StudioInput
            value={config.seo.defaultDescription}
            onChange={(event) =>
              onChange({
                ...config,
                seo: { ...config.seo, defaultDescription: event.target.value },
              })
            }
            placeholder="Leave empty to use the hero subtitle"
          />
        </StudioField>
        <StudioField
          label="Default keywords"
          hint="Comma-separated topics (e.g. texture art, wall art Mumbai, hotel lobby art)."
          fullWidth
        >
          <StudioInput
            value={config.seo.defaultKeywords}
            onChange={(event) =>
              onChange({
                ...config,
                seo: { ...config.seo, defaultKeywords: event.target.value },
              })
            }
          />
        </StudioField>
        <ImageUploadField
          label="Default share image (Open Graph)"
          path={config.seo.ogImageUrl}
          slug="seo"
          kind="hero"
          hint="Shown when links are shared on social apps. Falls back to the homepage hero image when empty."
          onUploaded={(path) =>
            onChange({
              ...config,
              seo: { ...config.seo, ogImageUrl: path },
            })
          }
        />
        <StudioField
          label="Google Search Console verification"
          hint='Paste only the content value from the HTML tag (not the full meta tag). Optional: set GOOGLE_SITE_VERIFICATION in Vercel instead.'
          fullWidth
        >
          <StudioInput
            value={config.seo.googleSiteVerification}
            onChange={(event) =>
              onChange({
                ...config,
                seo: {
                  ...config.seo,
                  googleSiteVerification: event.target.value,
                },
              })
            }
            placeholder="google-site-verification=…"
          />
        </StudioField>
      </StudioGroup>

      <StudioGroup eyebrow="Pages" title="Per-page title & description overrides">
        <div className="studio-repeater-list">
          {SITE_SEO_PAGE_KEYS.map((pageKey) => {
            const page = config.seo.pages[pageKey];
            return (
              <div key={pageKey} className="studio-repeater-item">
                <div className="studio-repeater-item-header">
                  <div className="studio-repeater-item-label">
                    <span className="studio-repeater-item-title">
                      {SEO_PAGE_LABELS[pageKey]}
                    </span>
                  </div>
                </div>
                <div className="studio-repeater-item-body">
                  <StudioFormGrid>
                    <StudioField label="Meta title">
                      <StudioInput
                        value={page.title}
                        onChange={(event) =>
                          onChange({
                            ...config,
                            seo: {
                              ...config.seo,
                              pages: {
                                ...config.seo.pages,
                                [pageKey]: {
                                  ...page,
                                  title: event.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Leave empty to use the page heading"
                      />
                    </StudioField>
                    <StudioField label="Keywords" fullWidth>
                      <StudioInput
                        value={page.keywords}
                        onChange={(event) =>
                          onChange({
                            ...config,
                            seo: {
                              ...config.seo,
                              pages: {
                                ...config.seo.pages,
                                [pageKey]: {
                                  ...page,
                                  keywords: event.target.value,
                                },
                              },
                            },
                          })
                        }
                      />
                    </StudioField>
                    <StudioField label="Meta description" fullWidth>
                      <StudioInput
                        value={page.description}
                        onChange={(event) =>
                          onChange({
                            ...config,
                            seo: {
                              ...config.seo,
                              pages: {
                                ...config.seo.pages,
                                [pageKey]: {
                                  ...page,
                                  description: event.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Leave empty to use on-page copy"
                      />
                    </StudioField>
                  </StudioFormGrid>
                </div>
              </div>
            );
          })}
        </div>
      </StudioGroup>
    </StudioSection>
  );
}
