"use client";

import {
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
  StudioSection,
  StudioShell,
  StudioTextarea,
} from "./shared";
import type { SiteConfig } from "@/types/site-config";

function updateStringList(list: string[], index: number, value: string) {
  return list.map((entry, entryIndex) => (entryIndex === index ? value : entry));
}

export function ConfigTab({
  config,
  onChange,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
}) {
  return (
    <StudioShell>
      <StudioSection title="Brand & contact" subtitle="Identity">
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
        </StudioGroup>

        <StudioGroup
          eyebrow="Contact"
          title="How visitors reach you"
          description="Shown in the footer, contact page, and order emails."
        >
          <StudioFormGrid>
            <StudioField label="Contact email">
              <StudioInput
                type="email"
                value={config.contactEmail}
                onChange={(event) => onChange({ ...config, contactEmail: event.target.value })}
              />
            </StudioField>
            <StudioField label="Admin email">
              <StudioInput
                type="email"
                value={config.adminEmail}
                onChange={(event) => onChange({ ...config, adminEmail: event.target.value })}
              />
            </StudioField>
            <StudioField label="WhatsApp number">
              <StudioInput
                value={config.whatsappNumber}
                onChange={(event) => onChange({ ...config, whatsappNumber: event.target.value })}
                placeholder="+919423690682"
              />
            </StudioField>
            <StudioField label="Studio address">
              <StudioInput
                value={config.studioAddress}
                onChange={(event) => onChange({ ...config, studioAddress: event.target.value })}
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>
      </StudioSection>

      <StudioSection title="Announcements & trust badges" subtitle="Header">
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

      <StudioSection title="Default product copy" subtitle="Product pages" defaultOpen={false}>
        <StudioGroup
          eyebrow="Defaults"
          title="Text shown on every artwork page"
          description="Individual artworks can override these in the Advanced step."
        >
          <StudioFormGrid>
            <StudioField label="Dispatch note">
              <StudioTextarea
                value={config.defaultDispatchNote}
                onChange={(event) =>
                  onChange({ ...config, defaultDispatchNote: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Care guide">
              <StudioTextarea
                value={config.defaultCareGuide}
                onChange={(event) =>
                  onChange({ ...config, defaultCareGuide: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Shipping & returns">
              <StudioTextarea
                value={config.defaultShippingReturns}
                onChange={(event) =>
                  onChange({ ...config, defaultShippingReturns: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Before you buy">
              <StudioTextarea
                value={config.defaultBeforeYouBuy}
                onChange={(event) =>
                  onChange({ ...config, defaultBeforeYouBuy: event.target.value })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>
      </StudioSection>

      <StudioSection title="Offers & features" subtitle="Promotions">
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
                    <StudioInput
                      value={offer.detail}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          offers: config.offers.map((entry, i) =>
                            i === index ? { ...entry, detail: event.target.value } : entry,
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
                    <StudioTextarea
                      value={feature.description}
                      onChange={(event) =>
                        onChange({
                          ...config,
                          productFeatures: config.productFeatures.map((entry, i) =>
                            i === index ? { ...entry, description: event.target.value } : entry,
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

      <StudioSection title="Visitor counter & social" subtitle="Footer">
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
    </StudioShell>
  );
}
