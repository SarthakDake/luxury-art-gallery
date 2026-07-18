"use client";

import {
  DocumentUploadField,
  ImageUploadField,
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
import type { StudioPreviewTarget } from "./preview-targets";
import type { SiteConfig, TradePoint, TradeProcessStep } from "@/types/site-config";

export function ForInteriorDesignersTab({
  config,
  onChange,
  onRequestPreview,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  const page = config.forInteriorDesigners;

  function updatePage(patch: Partial<typeof page>) {
    onChange({
      ...config,
      forInteriorDesigners: { ...page, ...patch },
    });
  }

  function updatePoints(
    key: "whyPartner" | "benefits",
    listKey: "points" | "items",
    next: TradePoint[],
  ) {
    const block = page[key];
    updatePage({
      [key]: {
        ...block,
        [listKey]: next,
      },
    });
  }

  return (
    <StudioShell>
      <StudioSection
        title="For Interior Designers"
        subtitle="Trade page"
        onPreview={() =>
          onRequestPreview?.({
            scope: "site",
            region: "homepage",
            label: "For Interior Designers homepage teaser",
          })
        }
      >
        <StudioGroup eyebrow="Hero" title="Page hero">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.hero.eyebrow}
                onChange={(event) =>
                  updatePage({ hero: { ...page.hero, eyebrow: event.target.value } })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.hero.title}
                onChange={(event) =>
                  updatePage({ hero: { ...page.hero, title: event.target.value } })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.hero.subtitle}
              onChange={(event) =>
                updatePage({ hero: { ...page.hero, subtitle: event.target.value } })
              }
            />
          </StudioField>
          <ImageUploadField
            label="Hero image"
            path={page.hero.imageUrl}
            slug="for-interior-designers"
            kind="hero"
            onUploaded={(path) =>
              updatePage({ hero: { ...page.hero, imageUrl: path } })
            }
            hint="Optional full-bleed background for the trade page hero."
          />
          <StudioFormGrid>
            <StudioField label="Primary CTA label">
              <StudioInput
                value={page.hero.primaryCtaLabel}
                onChange={(event) =>
                  updatePage({
                    hero: { ...page.hero, primaryCtaLabel: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Primary CTA link">
              <StudioInput
                value={page.hero.primaryCtaHref}
                onChange={(event) =>
                  updatePage({
                    hero: { ...page.hero, primaryCtaHref: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Secondary CTA label">
              <StudioInput
                value={page.hero.secondaryCtaLabel}
                onChange={(event) =>
                  updatePage({
                    hero: { ...page.hero, secondaryCtaLabel: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Secondary CTA link">
              <StudioInput
                value={page.hero.secondaryCtaHref}
                onChange={(event) =>
                  updatePage({
                    hero: { ...page.hero, secondaryCtaHref: event.target.value },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>

        <StudioGroup eyebrow="Why Partner With Us" title="Partnership story">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.whyPartner.eyebrow}
                onChange={(event) =>
                  updatePage({
                    whyPartner: { ...page.whyPartner, eyebrow: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.whyPartner.title}
                onChange={(event) =>
                  updatePage({
                    whyPartner: { ...page.whyPartner, title: event.target.value },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.whyPartner.subtitle}
              onChange={(event) =>
                updatePage({
                  whyPartner: { ...page.whyPartner, subtitle: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioRepeaterHeader
            title="Points"
            addLabel="Add point"
            onAdd={() =>
              updatePoints("whyPartner", "points", [
                ...page.whyPartner.points,
                { title: "New point", description: "" },
              ])
            }
          />
          <div className="studio-repeater-list">
            {page.whyPartner.points.map((point, index) => (
              <StudioRepeaterItem
                key={`why-${index}`}
                index={index}
                title={point.title || `Point ${index + 1}`}
                removeLabel="Remove point"
                onRemove={() =>
                  updatePoints(
                    "whyPartner",
                    "points",
                    page.whyPartner.points.filter((_, i) => i !== index),
                  )
                }
              >
                <StudioFormGrid>
                  <StudioField label="Title">
                    <StudioInput
                      value={point.title}
                      onChange={(event) => {
                        const next = [...page.whyPartner.points];
                        next[index] = { ...point, title: event.target.value };
                        updatePoints("whyPartner", "points", next);
                      }}
                    />
                  </StudioField>
                  <StudioField label="Description" fullWidth>
                    <StudioTextarea
                      rows={2}
                      value={point.description}
                      onChange={(event) => {
                        const next = [...page.whyPartner.points];
                        next[index] = { ...point, description: event.target.value };
                        updatePoints("whyPartner", "points", next);
                      }}
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup eyebrow="Benefits" title="Partner benefits">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.benefits.eyebrow}
                onChange={(event) =>
                  updatePage({
                    benefits: { ...page.benefits, eyebrow: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.benefits.title}
                onChange={(event) =>
                  updatePage({
                    benefits: { ...page.benefits, title: event.target.value },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.benefits.subtitle}
              onChange={(event) =>
                updatePage({
                  benefits: { ...page.benefits, subtitle: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioRepeaterHeader
            title="Benefit items"
            addLabel="Add benefit"
            onAdd={() =>
              updatePoints("benefits", "items", [
                ...page.benefits.items,
                { title: "New benefit", description: "" },
              ])
            }
          />
          <div className="studio-repeater-list">
            {page.benefits.items.map((item, index) => (
              <StudioRepeaterItem
                key={`benefit-${index}`}
                index={index}
                title={item.title || `Benefit ${index + 1}`}
                removeLabel="Remove benefit"
                onRemove={() =>
                  updatePoints(
                    "benefits",
                    "items",
                    page.benefits.items.filter((_, i) => i !== index),
                  )
                }
              >
                <StudioFormGrid>
                  <StudioField label="Title">
                    <StudioInput
                      value={item.title}
                      onChange={(event) => {
                        const next = [...page.benefits.items];
                        next[index] = { ...item, title: event.target.value };
                        updatePoints("benefits", "items", next);
                      }}
                    />
                  </StudioField>
                  <StudioField label="Description" fullWidth>
                    <StudioTextarea
                      rows={2}
                      value={item.description}
                      onChange={(event) => {
                        const next = [...page.benefits.items];
                        next[index] = { ...item, description: event.target.value };
                        updatePoints("benefits", "items", next);
                      }}
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup
          eyebrow="Portfolio PDF"
          title="Designer portfolio document"
          description="Upload a PDF from here. It appears on the For Interior Designers page with a download button."
        >
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.portfolioPdf.eyebrow}
                onChange={(event) =>
                  updatePage({
                    portfolioPdf: {
                      ...page.portfolioPdf,
                      eyebrow: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.portfolioPdf.title}
                onChange={(event) =>
                  updatePage({
                    portfolioPdf: {
                      ...page.portfolioPdf,
                      title: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Download button label">
              <StudioInput
                value={page.portfolioPdf.downloadLabel}
                onChange={(event) =>
                  updatePage({
                    portfolioPdf: {
                      ...page.portfolioPdf,
                      downloadLabel: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Download filename">
              <StudioInput
                value={page.portfolioPdf.filename}
                onChange={(event) =>
                  updatePage({
                    portfolioPdf: {
                      ...page.portfolioPdf,
                      filename: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.portfolioPdf.subtitle}
              onChange={(event) =>
                updatePage({
                  portfolioPdf: {
                    ...page.portfolioPdf,
                    subtitle: event.target.value,
                  },
                })
              }
            />
          </StudioField>
          <DocumentUploadField
            label="Portfolio PDF"
            path={page.portfolioPdf.url}
            filename={page.portfolioPdf.filename}
            slug="designer-portfolio"
            onUploaded={(path, filename) =>
              updatePage({
                portfolioPdf: {
                  ...page.portfolioPdf,
                  url: path,
                  filename: filename || page.portfolioPdf.filename,
                },
              })
            }
          />
        </StudioGroup>

        <StudioGroup
          eyebrow="On-page galleries"
          title="Signature Wall Art & Collections"
          description="These blocks reuse the same Signature Wall Art and Collections settings as the homepage (edit those under Signature Wall Art / Site Settings)."
        >
          <p className="studio-field-hint">
            Homepage Signature Wall Art and Collections sections are shown on this
            page automatically after the PDF block.
          </p>
        </StudioGroup>

        <StudioGroup eyebrow="Trade Process" title="Collaboration steps">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.tradeProcess.eyebrow}
                onChange={(event) =>
                  updatePage({
                    tradeProcess: {
                      ...page.tradeProcess,
                      eyebrow: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.tradeProcess.title}
                onChange={(event) =>
                  updatePage({
                    tradeProcess: {
                      ...page.tradeProcess,
                      title: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.tradeProcess.subtitle}
              onChange={(event) =>
                updatePage({
                  tradeProcess: {
                    ...page.tradeProcess,
                    subtitle: event.target.value,
                  },
                })
              }
            />
          </StudioField>
          <StudioRepeaterHeader
            title="Steps"
            addLabel="Add step"
            onAdd={() => {
              const steps: TradeProcessStep[] = [
                ...page.tradeProcess.steps,
                { title: "New step", description: "" },
              ];
              updatePage({
                tradeProcess: { ...page.tradeProcess, steps },
              });
            }}
          />
          <div className="studio-repeater-list">
            {page.tradeProcess.steps.map((step, index) => (
              <StudioRepeaterItem
                key={`step-${index}`}
                index={index}
                title={step.title || `Step ${index + 1}`}
                removeLabel="Remove step"
                onRemove={() =>
                  updatePage({
                    tradeProcess: {
                      ...page.tradeProcess,
                      steps: page.tradeProcess.steps.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Title">
                    <StudioInput
                      value={step.title}
                      onChange={(event) => {
                        const steps = [...page.tradeProcess.steps];
                        steps[index] = { ...step, title: event.target.value };
                        updatePage({
                          tradeProcess: { ...page.tradeProcess, steps },
                        });
                      }}
                    />
                  </StudioField>
                  <StudioField label="Description" fullWidth>
                    <StudioTextarea
                      rows={2}
                      value={step.description}
                      onChange={(event) => {
                        const steps = [...page.tradeProcess.steps];
                        steps[index] = {
                          ...step,
                          description: event.target.value,
                        };
                        updatePage({
                          tradeProcess: { ...page.tradeProcess, steps },
                        });
                      }}
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

        <StudioGroup eyebrow="Inquiry Form" title="Trade inquiry copy">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.inquiryForm.eyebrow}
                onChange={(event) =>
                  updatePage({
                    inquiryForm: {
                      ...page.inquiryForm,
                      eyebrow: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.inquiryForm.title}
                onChange={(event) =>
                  updatePage({
                    inquiryForm: {
                      ...page.inquiryForm,
                      title: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Submit button">
              <StudioInput
                value={page.inquiryForm.submitLabel}
                onChange={(event) =>
                  updatePage({
                    inquiryForm: {
                      ...page.inquiryForm,
                      submitLabel: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Email subject">
              <StudioInput
                value={page.inquiryForm.defaultSubject}
                onChange={(event) =>
                  updatePage({
                    inquiryForm: {
                      ...page.inquiryForm,
                      defaultSubject: event.target.value,
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.inquiryForm.subtitle}
              onChange={(event) =>
                updatePage({
                  inquiryForm: {
                    ...page.inquiryForm,
                    subtitle: event.target.value,
                  },
                })
              }
            />
          </StudioField>
          <StudioField label="Success message">
            <StudioTextarea
              rows={2}
              value={page.inquiryForm.successMessage}
              onChange={(event) =>
                updatePage({
                  inquiryForm: {
                    ...page.inquiryForm,
                    successMessage: event.target.value,
                  },
                })
              }
            />
          </StudioField>
        </StudioGroup>

        <StudioGroup
          eyebrow="Homepage teaser"
          title="Homepage “For Interior Designers” section"
          description="This short teaser still appears on the homepage. Edit its headings here."
        >
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={config.homepage.portfolio.eyebrow}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      portfolio: {
                        ...config.homepage.portfolio,
                        eyebrow: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={config.homepage.portfolio.title}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      portfolio: {
                        ...config.homepage.portfolio,
                        title: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Action label">
              <StudioInput
                value={config.homepage.portfolio.actionLabel ?? ""}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      portfolio: {
                        ...config.homepage.portfolio,
                        actionLabel: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
            <StudioField label="Action link">
              <StudioInput
                value={config.homepage.portfolio.actionHref ?? ""}
                onChange={(event) =>
                  onChange({
                    ...config,
                    homepage: {
                      ...config.homepage,
                      portfolio: {
                        ...config.homepage.portfolio,
                        actionHref: event.target.value,
                      },
                    },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={config.homepage.portfolio.subtitle}
              onChange={(event) =>
                onChange({
                  ...config,
                  homepage: {
                    ...config.homepage,
                    portfolio: {
                      ...config.homepage.portfolio,
                      subtitle: event.target.value,
                    },
                  },
                })
              }
            />
          </StudioField>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
