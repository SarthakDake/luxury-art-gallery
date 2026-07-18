"use client";

import {
  ImageUploadField,
  StudioColorField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
  StudioSection,
  StudioShell,
  StudioTextarea,
  StudioToggle,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import type { StudioPreviewTarget } from "./preview-targets";
import type { HomepageSectionId, SiteBrandTokens, SiteConfig } from "@/types/site-config";

function updateStringList(list: string[], index: number, value: string) {
  return list.map((entry, entryIndex) => (entryIndex === index ? value : entry));
}

const SECTION_LABELS: Record<HomepageSectionId, string> = {
  hero: "Hero",
  trustBadges: "Trust badges",
  collections: "Collections",
  featured: "Featured works",
  offers: "Offers",
  features: "Features",
  testimonials: "Testimonials",
};

const BRAND_COLOR_FIELDS: Array<{ key: keyof SiteBrandTokens; label: string }> = [
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Accent text" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "muted", label: "Muted text" },
  { key: "surface", label: "Surface" },
  { key: "border", label: "Border" },
  { key: "darkAccent", label: "Dark accent" },
  { key: "darkBackground", label: "Dark background" },
  { key: "darkForeground", label: "Dark foreground" },
  { key: "darkMuted", label: "Dark muted" },
  { key: "darkSurface", label: "Dark surface" },
  { key: "darkBorder", label: "Dark border" },
];

function moveHomepageSection(
  sections: SiteConfig["homepage"]["sections"],
  index: number,
  direction: -1 | 1,
) {
  const target = index + direction;
  if (target < 0 || target >= sections.length) {
    return sections;
  }

  const next = [...sections];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function ConfigTab({
  config,
  onChange,
  onRequestPreview,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  function preview(region: Extract<StudioPreviewTarget, { scope: "site" }>["region"], label: string) {
    onRequestPreview?.({ scope: "site", region, label });
  }

  return (
    <StudioShell>
      <StudioSection
        title="Brand & contact"
        subtitle="Identity"
        onPreview={() => preview("hero", "Homepage hero & site name")}
      >
        <StudioGroup eyebrow="Brand" title="Site name & homepage hero">
          <StudioFormGrid>
            <StudioField label="Site name">
              <StudioInput
                value={config.siteName}
                onChange={(event) => onChange({ ...config, siteName: event.target.value })}
              />
            </StudioField>
            <StudioField label="Hero title">
              <StudioInput
                value={config.heroTitle}
                onChange={(event) => onChange({ ...config, heroTitle: event.target.value })}
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Hero subtitle" fullWidth>
            <StudioTextarea
              value={config.heroSubtitle}
              onChange={(event) => onChange({ ...config, heroSubtitle: event.target.value })}
            />
          </StudioField>
          <ImageUploadField
            label="Hero image"
            path={config.homepage.hero.imageUrl}
            slug="homepage"
            kind="hero"
            hint="Full-bleed background on the homepage hero. Upload a wide photo for best results."
            onUploaded={(path) =>
              onChange({
                ...config,
                homepage: {
                  ...config.homepage,
                  hero: { ...config.homepage.hero, imageUrl: path },
                },
              })
            }
          />
        </StudioGroup>

        <StudioGroup
          eyebrow="Contact"
          title="How visitors reach you"
          description="Shown in the footer, contact page, and order notification emails."
        >
          <StudioFormGrid>
            <StudioField
              label="Contact email"
              hint="Public studio email. Separate multiple addresses with commas if needed."
              fullWidth
            >
              <StudioInput
                value={config.contactEmail}
                onChange={(event) => onChange({ ...config, contactEmail: event.target.value })}
                placeholder="colorsnjoybyaish@gmail.com"
              />
            </StudioField>
            <StudioField label="WhatsApp number">
              <StudioInput
                value={config.whatsappNumber}
                onChange={(event) => onChange({ ...config, whatsappNumber: event.target.value })}
                placeholder="+919423690682"
              />
            </StudioField>
            <StudioField label="Studio address" fullWidth>
              <StudioInput
                value={config.studioAddress}
                onChange={(event) => onChange({ ...config, studioAddress: event.target.value })}
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>

        <StudioGroup
          eyebrow="Admin"
          title="Dashboard access"
          description="Google accounts that can open Content Studio and order management. Not shown on the public site."
        >
          <StudioField
            label="Admin emails"
            hint="Separate multiple Google sign-in emails with commas."
            fullWidth
          >
            <StudioInput
              value={config.adminEmail}
              onChange={(event) => onChange({ ...config, adminEmail: event.target.value })}
              placeholder="you@gmail.com, partner@gmail.com"
            />
          </StudioField>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Announcements & trust badges"
        subtitle="Header"
        onPreview={() => preview("announcements", "Header announcements & trust badges")}
      >
        <StudioGroup eyebrow="Header bar" title="Announcement messages">
          <StudioRepeaterHeader
            title="Lines in the top bar"
            addLabel="Add line"
            onAdd={() => onChange({ ...config, announcements: [...config.announcements, ""] })}
          />
          <div className="studio-repeater-list">
            {config.announcements.map((item, index) => (
              <StudioRepeaterItem
                key={`announcement-${index}`}
                index={index}
                title={`Announcement ${index + 1}`}
                removeLabel="Remove announcement"
                onRemove={() =>
                  onChange({
                    ...config,
                    announcements: config.announcements.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioInput
                  value={item}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      announcements: updateStringList(
                        config.announcements,
                        index,
                        event.target.value,
                      ),
                    })
                  }
                />
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup eyebrow="Trust" title="Trust badges">
          <StudioRepeaterHeader
            title="Badge labels"
            addLabel="Add badge"
            onAdd={() => onChange({ ...config, trustBadges: [...config.trustBadges, ""] })}
          />
          <div className="studio-repeater-list">
            {config.trustBadges.map((item, index) => (
              <StudioRepeaterItem
                key={`badge-${index}`}
                index={index}
                title={`Badge ${index + 1}`}
                removeLabel="Remove badge"
                onRemove={() =>
                  onChange({
                    ...config,
                    trustBadges: config.trustBadges.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioInput
                  value={item}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      trustBadges: updateStringList(config.trustBadges, index, event.target.value),
                    })
                  }
                />
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Default product copy"
        subtitle="Product pages"
        defaultOpen={false}
        onPreview={() => preview("product-copy", "Default copy on product pages")}
      >
        <StudioGroup
          eyebrow="Defaults"
          title="Text shown on every artwork page"
          description="Formatting is preserved in Product Details. Individual artworks can override these in the Advanced step."
        >
          <StudioField label="Dispatch note" fullWidth>
            <RichTextEditor
              value={config.defaultDispatchNote}
              onChange={(defaultDispatchNote) =>
                onChange({ ...config, defaultDispatchNote })
              }
              rows={4}
              compact
              showHint={false}
            />
          </StudioField>
          <StudioField label="Care guide" fullWidth>
            <RichTextEditor
              value={config.defaultCareGuide}
              onChange={(defaultCareGuide) => onChange({ ...config, defaultCareGuide })}
              rows={8}
              compact
            />
          </StudioField>
          <StudioField label="Shipping & returns" fullWidth>
            <RichTextEditor
              value={config.defaultShippingReturns}
              onChange={(defaultShippingReturns) =>
                onChange({ ...config, defaultShippingReturns })
              }
              rows={8}
              compact
            />
          </StudioField>
          <StudioField label="Before you buy" fullWidth>
            <RichTextEditor
              value={config.defaultBeforeYouBuy}
              onChange={(defaultBeforeYouBuy) =>
                onChange({ ...config, defaultBeforeYouBuy })
              }
              rows={8}
              compact
            />
          </StudioField>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Offers & features"
        subtitle="Promotions"
        onPreview={() => preview("promotions", "Homepage offers & features")}
      >
        <StudioGroup eyebrow="Promotions" title="Promo offers">
          <StudioRepeaterHeader
            title="Active offers"
            addLabel="Add offer"
            onAdd={() =>
              onChange({
                ...config,
                offers: [...config.offers, { headline: "", code: "", detail: "" }],
              })
            }
          />
          <div className="studio-repeater-list">
            {config.offers.map((offer, index) => (
              <StudioRepeaterItem
                key={`offer-${index}`}
                index={index}
                title={offer.headline || `Offer ${index + 1}`}
                removeLabel="Remove offer"
                onRemove={() =>
                  onChange({
                    ...config,
                    offers: config.offers.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Headline">
                    <StudioInput
                      value={offer.headline}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          offers: config.offers.map((entry, i) =>
                            i === index ? { ...entry, headline: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Promo code">
                    <StudioInput
                      value={offer.code}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          offers: config.offers.map((entry, i) =>
                            i === index ? { ...entry, code: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Detail" fullWidth>
                    <RichTextEditor
                      value={offer.detail}
                      onChange={(detail) =>
                        onChange({
                          ...config,
                          offers: config.offers.map((entry, i) =>
                            i === index ? { ...entry, detail } : entry,
                          ),
                        })
                      }
                      rows={4}
                      compact
                      showHint={false}
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup eyebrow="Product page" title="Feature highlights">
          <StudioRepeaterHeader
            title="Feature blocks"
            addLabel="Add feature"
            onAdd={() =>
              onChange({
                ...config,
                productFeatures: [...config.productFeatures, { title: "", description: "" }],
              })
            }
          />
          <div className="studio-repeater-list">
            {config.productFeatures.map((feature, index) => (
              <StudioRepeaterItem
                key={`feature-${index}`}
                index={index}
                title={feature.title || `Feature ${index + 1}`}
                removeLabel="Remove feature"
                onRemove={() =>
                  onChange({
                    ...config,
                    productFeatures: config.productFeatures.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Title">
                    <StudioInput
                      value={feature.title}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          productFeatures: config.productFeatures.map((entry, i) =>
                            i === index ? { ...entry, title: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Description" fullWidth>
                    <RichTextEditor
                      value={feature.description}
                      onChange={(description) =>
                        onChange({
                          ...config,
                          productFeatures: config.productFeatures.map((entry, i) =>
                            i === index ? { ...entry, description } : entry,
                          ),
                        })
                      }
                      rows={5}
                      compact
                      showHint={false}
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Visitor counter & social"
        subtitle="Footer"
        onPreview={() => preview("footer", "Footer contact & social")}
      >
        <StudioGroup eyebrow="Counter" title="Visitor counter labels">
          <StudioFormGrid>
            <StudioField label="Counter eyebrow">
              <StudioInput
                value={config.visitorCounter.eyebrow}
                onChange={(event) =>
                  onChange({
                    ...config,
                    visitorCounter: { ...config.visitorCounter, eyebrow: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Singular label">
              <StudioInput
                value={config.visitorCounter.singularLabel}
                onChange={(event) =>
                  onChange({
                    ...config,
                    visitorCounter: {
                      ...config.visitorCounter,
                      singularLabel: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Plural label">
              <StudioInput
                value={config.visitorCounter.pluralLabel}
                onChange={(event) =>
                  onChange({
                    ...config,
                    visitorCounter: {
                      ...config.visitorCounter,
                      pluralLabel: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>

        <StudioGroup eyebrow="Social" title="Social media links">
          <StudioFormGrid>
            {(Object.keys(config.socialLinks) as Array<keyof SiteConfig["socialLinks"]>).map(
              (key) => (
                <StudioField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                  <StudioInput
                    value={config.socialLinks[key]}
                    onChange={(event) =>
                      onChange({
                        ...config,
                        socialLinks: { ...config.socialLinks, [key]: event.target.value },
                      })
                    }
                  />
                </StudioField>
              ),
            )}
          </StudioFormGrid>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Brand tokens"
        subtitle="Theme"
        defaultOpen={false}
        onPreview={() => preview("theme", "Theme colors on homepage")}
      >
        <StudioGroup
          eyebrow="Look"
          title="Colors & radii"
          description="These map to CSS variables and the Tailwind theme bridge. Leave defaults unless you are restyling the storefront."
        >
          <StudioFormGrid>
            {BRAND_COLOR_FIELDS.map(({ key, label }) => (
              <StudioColorField
                key={key}
                label={label}
                value={config.brand[key]}
                onChange={(value) =>
                  onChange({
                    ...config,
                    brand: { ...config.brand, [key]: value },
                  })
                }
              />
            ))}
            <StudioField label="Radius SM">
              <StudioInput
                value={config.brand.radiusSm}
                onChange={(event) =>
                  onChange({
                    ...config,
                    brand: { ...config.brand, radiusSm: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Radius MD">
              <StudioInput
                value={config.brand.radiusMd}
                onChange={(event) =>
                  onChange({
                    ...config,
                    brand: { ...config.brand, radiusMd: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Radius LG">
              <StudioInput
                value={config.brand.radiusLg}
                onChange={(event) =>
                  onChange({
                    ...config,
                    brand: { ...config.brand, radiusLg: event.target.value },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Homepage sections"
        subtitle="Layout"
        defaultOpen={false}
        onPreview={() => preview("homepage", "Homepage section layout")}
      >
        <StudioGroup
          eyebrow="Order"
          title="Section visibility & order"
          description="Reorder and toggle sections. Offers, features, and testimonials also need their feature flags on."
        >
          <div className="studio-repeater-list">
            {config.homepage.sections.map((section, index) => (
              <div key={section.id} className="studio-repeater-item">
                <div className="studio-repeater-item-header">
                  <div className="studio-repeater-item-label">
                    <span className="studio-repeater-index">{index + 1}</span>
                    <span className="studio-repeater-item-title">
                      {SECTION_LABELS[section.id]}
                    </span>
                  </div>
                  <div className="studio-inline-actions">
                    <button
                      type="button"
                      className="btn-secondary studio-toolbar-btn"
                      disabled={index === 0}
                      onClick={() =>
                        onChange({
                          ...config,
                          homepage: {
                            ...config.homepage,
                            sections: moveHomepageSection(
                              config.homepage.sections,
                              index,
                              -1,
                            ),
                          },
                        })
                      }
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn-secondary studio-toolbar-btn"
                      disabled={index === config.homepage.sections.length - 1}
                      onClick={() =>
                        onChange({
                          ...config,
                          homepage: {
                            ...config.homepage,
                            sections: moveHomepageSection(
                              config.homepage.sections,
                              index,
                              1,
                            ),
                          },
                        })
                      }
                    >
                      Down
                    </button>
                  </div>
                </div>
                <div className="studio-repeater-item-body">
                  <StudioToggle
                    label={section.enabled ? "Shown on homepage" : "Hidden on homepage"}
                    checked={section.enabled}
                    onChange={(checked) =>
                      onChange({
                        ...config,
                        homepage: {
                          ...config.homepage,
                          sections: config.homepage.sections.map((entry, i) =>
                            i === index ? { ...entry, enabled: checked } : entry,
                          ),
                        },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup eyebrow="Hero CTAs" title="Call-to-action labels">
          <StudioFormGrid>
            <StudioField label="Primary CTA label">
              <StudioInput
                value={config.homepage.hero.primaryCtaLabel}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      hero: {
                        ...config.homepage.hero,
                        primaryCtaLabel: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Primary CTA link">
              <StudioInput
                value={config.homepage.hero.primaryCtaHref}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      hero: {
                        ...config.homepage.hero,
                        primaryCtaHref: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Secondary CTA label">
              <StudioInput
                value={config.homepage.hero.secondaryCtaLabel}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      hero: {
                        ...config.homepage.hero,
                        secondaryCtaLabel: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Secondary CTA link">
              <StudioInput
                value={config.homepage.hero.secondaryCtaHref}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      hero: {
                        ...config.homepage.hero,
                        secondaryCtaHref: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>

        <StudioGroup eyebrow="Copy" title="Collections & featured headings">
          <StudioFormGrid>
            <StudioField label="Collections eyebrow">
              <StudioInput
                value={config.homepage.collections.eyebrow}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      collections: {
                        ...config.homepage.collections,
                        eyebrow: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Collections title">
              <StudioInput
                value={config.homepage.collections.title}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      collections: {
                        ...config.homepage.collections,
                        title: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Featured eyebrow">
              <StudioInput
                value={config.homepage.featured.eyebrow}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      featured: {
                        ...config.homepage.featured,
                        eyebrow: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Featured title">
              <StudioInput
                value={config.homepage.featured.title}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      featured: {
                        ...config.homepage.featured,
                        title: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Featured count">
              <StudioInput
                type="number"
                min={1}
                value={config.homepage.featured.limit}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      featured: {
                        ...config.homepage.featured,
                        limit: Number(event.target.value) || 4,
                      },
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Feature flags"
        subtitle="Progressive ship"
        defaultOpen={false}
        onPreview={() => preview("homepage", "Homepage with feature flags applied")}
      >
        <StudioGroup
          eyebrow="Gates"
          title="Turn new homepage modules on/off"
          description="Ship the redesign incrementally. A section must be enabled above and its flag must be on."
        >
          <StudioToggle
            label="Homepage offers section"
            checked={config.features.homepageOffers}
            onChange={(checked) =>
              onChange({
                ...config,
                features: { ...config.features, homepageOffers: checked },
              })
            }
          />
          <StudioToggle
            label="Homepage features section"
            checked={config.features.homepageFeatures}
            onChange={(checked) =>
              onChange({
                ...config,
                features: { ...config.features, homepageFeatures: checked },
              })
            }
          />
          <StudioToggle
            label="Homepage testimonials section"
            checked={config.features.homepageTestimonials}
            onChange={(checked) =>
              onChange({
                ...config,
                features: { ...config.features, homepageTestimonials: checked },
              })
            }
          />
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Testimonials"
        subtitle="Social proof"
        defaultOpen={false}
        onPreview={() => preview("testimonials", "Homepage testimonials")}
      >
        <StudioGroup eyebrow="Quotes" title="Collector testimonials">
          <StudioRepeaterHeader
            title="Testimonials"
            addLabel="Add testimonial"
            onAdd={() =>
              onChange({
                ...config,
                testimonials: [
                  ...config.testimonials,
                  { quote: "", name: "", role: "" },
                ],
              })
            }
          />
          <div className="studio-repeater-list">
            {config.testimonials.map((item, index) => (
              <StudioRepeaterItem
                key={`testimonial-${index}`}
                index={index}
                title={item.name || `Testimonial ${index + 1}`}
                removeLabel="Remove testimonial"
                onRemove={() =>
                  onChange({
                    ...config,
                    testimonials: config.testimonials.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Quote" fullWidth>
                    <RichTextEditor
                      value={item.quote}
                      onChange={(quote) =>
                        onChange({
                          ...config,
                          testimonials: config.testimonials.map((entry, i) =>
                            i === index ? { ...entry, quote } : entry,
                          ),
                        })
                      }
                      rows={5}
                      compact
                      showHint={false}
                    />
                  </StudioField>
                  <StudioField label="Name">
                    <StudioInput
                      value={item.name}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          testimonials: config.testimonials.map((entry, i) =>
                            i === index ? { ...entry, name: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Role">
                    <StudioInput
                      value={item.role}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          testimonials: config.testimonials.map((entry, i) =>
                            i === index ? { ...entry, role: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
