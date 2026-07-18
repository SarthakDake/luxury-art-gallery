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
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import type { StudioPreviewTarget } from "./preview-targets";
import { DEFAULT_FOR_INTERIOR_DESIGNERS } from "@/lib/site-config/defaults";
import type {
  ForInteriorDesignersConfig,
  SiteConfig,
  TradeHomepageImage,
  TradePoint,
  TradeProcessStep,
} from "@/types/site-config";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  const [removed] = next.splice(index, 1);
  next.splice(target, 0, removed);
  return next;
}

export function ForInteriorDesignersTab({
  config,
  onChange,
  onRequestPreview,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  const page: ForInteriorDesignersConfig = {
    ...DEFAULT_FOR_INTERIOR_DESIGNERS,
    ...(config.forInteriorDesigners ?? {}),
    homepageImages:
      config.forInteriorDesigners?.homepageImages ??
      DEFAULT_FOR_INTERIOR_DESIGNERS.homepageImages,
  };

  function preview(
    region: Extract<StudioPreviewTarget, { scope: "trade" }>["region"],
    label: string,
  ) {
    onRequestPreview?.({ scope: "trade", region, label });
  }

  function commitPage(next: ForInteriorDesignersConfig) {
    onChange({
      ...config,
      forInteriorDesigners: next,
    });
  }

  function updatePage(patch: Partial<ForInteriorDesignersConfig>) {
    commitPage({ ...page, ...patch });
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
        title="Hero"
        subtitle="Trade page hero"
        onPreview={() => preview("hero", "For Interior Designers — hero")}
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.hero.subtitle}
              onChange={(subtitle) =>
                updatePage({ hero: { ...page.hero, subtitle } })
              }
              rows={3}
              compact
              showHint={false}
            />
          </StudioField>
          <ImageUploadField
            label="Hero image"
            path={page.hero.imageUrl}
            slug="trade-hero"
            kind="page"
            onUploaded={(path) =>
              updatePage({ hero: { ...page.hero, imageUrl: path } })
            }
            hint="Full-bleed background for the trade page hero. Replaces the default sample image."
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
      </StudioSection>

      <StudioSection
        title="Why Partner"
        subtitle="Partnership story"
        onPreview={() => preview("whyPartner", "For Interior Designers — why partner")}
      >
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.whyPartner.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  whyPartner: { ...page.whyPartner, subtitle },
                })
              }
              rows={3}
              compact
              showHint={false}
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
                    <RichTextEditor
                      value={point.description}
                      onChange={(description) => {
                        const next = [...page.whyPartner.points];
                        next[index] = { ...point, description };
                        updatePoints("whyPartner", "points", next);
                      }}
                      rows={2}
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
        title="Benefits"
        subtitle="Partner benefits"
        onPreview={() => preview("benefits", "For Interior Designers — benefits")}
      >
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.benefits.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  benefits: { ...page.benefits, subtitle },
                })
              }
              rows={3}
              compact
              showHint={false}
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
                    <RichTextEditor
                      value={item.description}
                      onChange={(description) => {
                        const next = [...page.benefits.items];
                        next[index] = { ...item, description };
                        updatePoints("benefits", "items", next);
                      }}
                      rows={2}
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
        title="Trade Process"
        subtitle="Collaboration steps"
        onPreview={() => preview("process", "For Interior Designers — process")}
      >
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.tradeProcess.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  tradeProcess: {
                    ...page.tradeProcess,
                    subtitle,
                  },
                })
              }
              rows={3}
              compact
              showHint={false}
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
                    <RichTextEditor
                      value={step.description}
                      onChange={(description) => {
                        const steps = [...page.tradeProcess.steps];
                        steps[index] = {
                          ...step,
                          description,
                        };
                        updatePage({
                          tradeProcess: { ...page.tradeProcess, steps },
                        });
                      }}
                      rows={2}
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
        title="Portfolio PDF"
        subtitle="Designer portfolio document"
        onPreview={() => preview("pdf", "For Interior Designers — portfolio PDF")}
      >
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.portfolioPdf.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  portfolioPdf: {
                    ...page.portfolioPdf,
                    subtitle,
                  },
                })
              }
              rows={3}
              compact
              showHint={false}
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
          title="Signature Wall Art"
          description="This block reuses the same Signature Wall Art settings as the homepage (edit under Signature Wall Art)."
        >
          <p className="studio-field-hint">
            Signature Wall Art is shown on this page automatically after the
            Studio Portfolio PDF block.
          </p>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Inquiry"
        subtitle="Trade inquiry form"
        onPreview={() => preview("inquiry", "For Interior Designers — inquiry")}
      >
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.inquiryForm.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  inquiryForm: {
                    ...page.inquiryForm,
                    subtitle,
                  },
                })
              }
              rows={3}
              compact
              showHint={false}
            />
          </StudioField>
          <StudioField label="Success message" fullWidth>
            <RichTextEditor
              value={page.inquiryForm.successMessage}
              onChange={(successMessage) =>
                updatePage({
                  inquiryForm: {
                    ...page.inquiryForm,
                    successMessage,
                  },
                })
              }
              rows={2}
              compact
              showHint={false}
            />
          </StudioField>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Homepage teaser"
        subtitle="Trade Partners section on the homepage"
        onPreview={() => preview("homepage", "For Interior Designers homepage teaser")}
      >
        <StudioGroup
          eyebrow="Homepage teaser"
          title="Homepage “For Interior Designers” section"
          description="Headings and trade imagery for the homepage Trade Partners section. Uses these images — not shop artworks."
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
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={config.homepage.portfolio.subtitle}
              onChange={(subtitle) =>
                onChange({
                  ...config,
                  homepage: {
                    ...config.homepage,
                    portfolio: {
                      ...config.homepage.portfolio,
                      subtitle,
                    },
                  },
                })
              }
              rows={3}
              compact
              showHint={false}
            />
          </StudioField>

          <StudioRepeaterHeader
            title="Homepage trade images"
            addLabel="Add image"
            onAdd={() => {
              const next: TradeHomepageImage = { imageUrl: "", caption: "" };
              updatePage({
                homepageImages: [...(page.homepageImages ?? []), next],
              });
            }}
          />
          {(page.homepageImages ?? []).map((item, index) => (
            <StudioRepeaterItem
              key={`trade-home-image-${index}`}
              index={index}
              title={item.caption || `Image ${index + 1}`}
              onMoveUp={
                index > 0
                  ? () =>
                      updatePage({
                        homepageImages: moveItem(
                          page.homepageImages,
                          index,
                          -1,
                        ),
                      })
                  : undefined
              }
              onMoveDown={
                index < page.homepageImages.length - 1
                  ? () =>
                      updatePage({
                        homepageImages: moveItem(
                          page.homepageImages,
                          index,
                          1,
                        ),
                      })
                  : undefined
              }
              onRemove={() =>
                updatePage({
                  homepageImages: page.homepageImages.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              <ImageUploadField
                label="Image"
                path={item.imageUrl}
                slug={`trade-home-${index + 1}`}
                kind="page"
                onUploaded={(path) => {
                  const homepageImages = [...page.homepageImages];
                  homepageImages[index] = { ...item, imageUrl: path };
                  updatePage({ homepageImages });
                }}
                hint="Trade / interior partnership imagery for the homepage gallery."
              />
              <StudioField label="Caption (optional)">
                <StudioInput
                  value={item.caption}
                  onChange={(event) => {
                    const homepageImages = [...page.homepageImages];
                    homepageImages[index] = {
                      ...item,
                      caption: event.target.value,
                    };
                    updatePage({ homepageImages });
                  }}
                />
              </StudioField>
            </StudioRepeaterItem>
          ))}
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
