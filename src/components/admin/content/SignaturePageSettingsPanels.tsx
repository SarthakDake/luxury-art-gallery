"use client";

import {
  ImageUploadField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import type { SignaturePageSettingsStep } from "./SignatureEditorShell";
import type {
  CuratedWorksCopy,
  SignatureFaqItem,
  SignaturePageSectionId,
  SignatureWallArtPageConfig,
  TradeProcessStep,
} from "@/types/site-config";

const SECTION_LABELS: Record<SignaturePageSectionId, string> = {
  projects: "Projects grid",
  process: "Our process",
  faq: "FAQ",
  inquiry: "Inquiry form",
};

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function SignaturePageSettingsPanels({
  step,
  page,
  homepageCopy,
  updatePage,
  updateHomepageTeaser,
  moveSection,
}: {
  step: SignaturePageSettingsStep;
  page: SignatureWallArtPageConfig;
  homepageCopy: CuratedWorksCopy;
  updatePage: (patch: Partial<SignatureWallArtPageConfig>) => void;
  updateHomepageTeaser: (patch: Partial<CuratedWorksCopy>) => void;
  moveSection: (index: number, direction: -1 | 1) => void;
}) {
  if (step === "layout") {
    return (
      <StudioGroup
        eyebrow="Layout"
        title="Section order"
        description="Hero and intro stay at the top. Reorder Projects, Process, FAQ, and Inquiry below."
      >
        <div className="studio-repeater-list">
          {page.sectionOrder.map((sectionId, index) => (
            <StudioRepeaterItem
              key={sectionId}
              index={index}
              title={SECTION_LABELS[sectionId]}
              showRemove={false}
              onMoveUp={index > 0 ? () => moveSection(index, -1) : undefined}
              onMoveDown={
                index < page.sectionOrder.length - 1
                  ? () => moveSection(index, 1)
                  : undefined
              }
            >
              <p className="studio-field-hint">
                Use the arrows to change where this block appears on the live Signature Wall Art page.
              </p>
            </StudioRepeaterItem>
          ))}
        </div>
      </StudioGroup>
    );
  }

  if (step === "hero") {
    return (
      <>
        <StudioGroup
          eyebrow="Hero"
          title="Page hero image"
          description="Full-width image at the top of /signature-wall-art."
        >
          <ImageUploadField
            label="Hero image"
            path={page.hero.imageUrl}
            slug="signature-page-hero"
            kind="page"
            onUploaded={(path) => updatePage({ hero: { ...page.hero, imageUrl: path } })}
          />
        </StudioGroup>
        <StudioGroup eyebrow="Intro" title="Introduction copy">
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={page.intro.eyebrow}
                onChange={(event) =>
                  updatePage({
                    intro: { ...page.intro, eyebrow: event.target.value },
                  })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={page.intro.title}
                onChange={(event) =>
                  updatePage({
                    intro: { ...page.intro, title: event.target.value },
                  })
                }
              />
            </StudioField>
          </StudioFormGrid>
          <StudioField label="Subtitle" fullWidth>
            <RichTextEditor
              value={page.intro.subtitle}
              onChange={(subtitle) =>
                updatePage({
                  intro: { ...page.intro, subtitle },
                })
              }
              rows={3}
              compact
              showHint={false}
            />
          </StudioField>
        </StudioGroup>
      </>
    );
  }

  if (step === "grid") {
    return (
      <StudioGroup
        eyebrow="Projects grid"
        title="Grid heading copy"
        description="Headline above the showcase project cards. Individual projects are edited under Showcase projects."
      >
        <StudioFormGrid>
          <StudioField label="Section eyebrow">
            <StudioInput
              value={page.projects.eyebrow}
              onChange={(event) =>
                updatePage({
                  projects: { ...page.projects, eyebrow: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Section title">
            <StudioInput
              value={page.projects.title}
              onChange={(event) =>
                updatePage({
                  projects: { ...page.projects, title: event.target.value },
                })
              }
            />
          </StudioField>
        </StudioFormGrid>
        <StudioField label="Section subtitle" fullWidth>
          <RichTextEditor
            value={page.projects.subtitle}
            onChange={(subtitle) =>
              updatePage({
                projects: { ...page.projects, subtitle },
              })
            }
            rows={2}
            compact
            showHint={false}
          />
        </StudioField>
      </StudioGroup>
    );
  }

  if (step === "process") {
    return (
      <StudioGroup eyebrow="Process" title="Our process for statement wall art">
        <StudioFormGrid>
          <StudioField label="Eyebrow">
            <StudioInput
              value={page.process.eyebrow}
              onChange={(event) =>
                updatePage({
                  process: { ...page.process, eyebrow: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Title">
            <StudioInput
              value={page.process.title}
              onChange={(event) =>
                updatePage({
                  process: { ...page.process, title: event.target.value },
                })
              }
            />
          </StudioField>
        </StudioFormGrid>
        <StudioField label="Subtitle" fullWidth>
          <RichTextEditor
            value={page.process.subtitle}
            onChange={(subtitle) =>
              updatePage({
                process: { ...page.process, subtitle },
              })
            }
            rows={2}
            compact
            showHint={false}
          />
        </StudioField>
        <StudioRepeaterHeader
          title="Steps"
          addLabel="Add step"
          onAdd={() => {
            const steps: TradeProcessStep[] = [
              ...page.process.steps,
              { title: "New step", description: "" },
            ];
            updatePage({ process: { ...page.process, steps } });
          }}
        />
        <div className="studio-repeater-list">
          {page.process.steps.map((processStep, index) => (
            <StudioRepeaterItem
              key={`process-${index}`}
              index={index}
              title={processStep.title || `Step ${index + 1}`}
              removeLabel="Remove step"
              onMoveUp={
                index > 0
                  ? () =>
                      updatePage({
                        process: {
                          ...page.process,
                          steps: moveItem(page.process.steps, index, -1),
                        },
                      })
                  : undefined
              }
              onMoveDown={
                index < page.process.steps.length - 1
                  ? () =>
                      updatePage({
                        process: {
                          ...page.process,
                          steps: moveItem(page.process.steps, index, 1),
                        },
                      })
                  : undefined
              }
              onRemove={() =>
                updatePage({
                  process: {
                    ...page.process,
                    steps: page.process.steps.filter((_, i) => i !== index),
                  },
                })
              }
            >
              <StudioField label="Title">
                <StudioInput
                  value={processStep.title}
                  onChange={(event) => {
                    const steps = [...page.process.steps];
                    steps[index] = { ...processStep, title: event.target.value };
                    updatePage({ process: { ...page.process, steps } });
                  }}
                />
              </StudioField>
              <StudioField label="Description" fullWidth>
                <RichTextEditor
                  value={processStep.description}
                  onChange={(description) => {
                    const steps = [...page.process.steps];
                    steps[index] = { ...processStep, description };
                    updatePage({ process: { ...page.process, steps } });
                  }}
                  rows={2}
                  compact
                  showHint={false}
                />
              </StudioField>
            </StudioRepeaterItem>
          ))}
        </div>
      </StudioGroup>
    );
  }

  if (step === "faq") {
    return (
      <StudioGroup eyebrow="FAQ" title="FAQ for statement wall arts">
        <StudioFormGrid>
          <StudioField label="Eyebrow">
            <StudioInput
              value={page.faq.eyebrow}
              onChange={(event) =>
                updatePage({ faq: { ...page.faq, eyebrow: event.target.value } })
              }
            />
          </StudioField>
          <StudioField label="Title">
            <StudioInput
              value={page.faq.title}
              onChange={(event) =>
                updatePage({ faq: { ...page.faq, title: event.target.value } })
              }
            />
          </StudioField>
        </StudioFormGrid>
        <StudioField label="Subtitle" fullWidth>
          <RichTextEditor
            value={page.faq.subtitle}
            onChange={(subtitle) =>
              updatePage({
                faq: { ...page.faq, subtitle },
              })
            }
            rows={2}
            compact
            showHint={false}
          />
        </StudioField>
        <StudioRepeaterHeader
          title="Questions"
          addLabel="Add question"
          onAdd={() => {
            const items: SignatureFaqItem[] = [
              ...page.faq.items,
              { question: "New question", answer: "" },
            ];
            updatePage({ faq: { ...page.faq, items } });
          }}
        />
        <div className="studio-repeater-list">
          {page.faq.items.map((item, index) => (
            <StudioRepeaterItem
              key={`faq-${index}`}
              index={index}
              title={item.question || `Question ${index + 1}`}
              removeLabel="Remove question"
              onMoveUp={
                index > 0
                  ? () =>
                      updatePage({
                        faq: {
                          ...page.faq,
                          items: moveItem(page.faq.items, index, -1),
                        },
                      })
                  : undefined
              }
              onMoveDown={
                index < page.faq.items.length - 1
                  ? () =>
                      updatePage({
                        faq: {
                          ...page.faq,
                          items: moveItem(page.faq.items, index, 1),
                        },
                      })
                  : undefined
              }
              onRemove={() =>
                updatePage({
                  faq: {
                    ...page.faq,
                    items: page.faq.items.filter((_, i) => i !== index),
                  },
                })
              }
            >
              <StudioField label="Question">
                <StudioInput
                  value={item.question}
                  onChange={(event) => {
                    const items = [...page.faq.items];
                    items[index] = { ...item, question: event.target.value };
                    updatePage({ faq: { ...page.faq, items } });
                  }}
                />
              </StudioField>
              <StudioField label="Answer" fullWidth>
                <RichTextEditor
                  value={item.answer}
                  onChange={(answer) => {
                    const items = [...page.faq.items];
                    items[index] = { ...item, answer };
                    updatePage({ faq: { ...page.faq, items } });
                  }}
                  rows={3}
                  compact
                  showHint={false}
                />
              </StudioField>
            </StudioRepeaterItem>
          ))}
        </div>
      </StudioGroup>
    );
  }

  if (step === "inquiry") {
    return (
      <StudioGroup eyebrow="Inquiry" title="Inquiry form & WhatsApp">
        <StudioFormGrid>
          <StudioField label="Eyebrow">
            <StudioInput
              value={page.inquiry.eyebrow}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, eyebrow: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Title">
            <StudioInput
              value={page.inquiry.title}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, title: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Form button label">
            <StudioInput
              value={page.inquiry.formCtaLabel}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, formCtaLabel: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Form link" hint="Use #inquiry on this page, or /contact.">
            <StudioInput
              value={page.inquiry.formHref}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, formHref: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="WhatsApp button label">
            <StudioInput
              value={page.inquiry.whatsappLabel}
              onChange={(event) =>
                updatePage({
                  inquiry: {
                    ...page.inquiry,
                    whatsappLabel: event.target.value,
                  },
                })
              }
            />
          </StudioField>
          <StudioField label="Submit button label">
            <StudioInput
              value={page.inquiry.submitLabel}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, submitLabel: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Default email subject">
            <StudioInput
              value={page.inquiry.defaultSubject}
              onChange={(event) =>
                updatePage({
                  inquiry: {
                    ...page.inquiry,
                    defaultSubject: event.target.value,
                  },
                })
              }
            />
          </StudioField>
        </StudioFormGrid>
        <StudioField label="Subtitle" fullWidth>
          <RichTextEditor
            value={page.inquiry.subtitle}
            onChange={(subtitle) =>
              updatePage({
                inquiry: { ...page.inquiry, subtitle },
              })
            }
            rows={2}
            compact
            showHint={false}
          />
        </StudioField>
        <StudioField label="Success message" fullWidth>
          <RichTextEditor
            value={page.inquiry.successMessage}
            onChange={(successMessage) =>
              updatePage({
                inquiry: {
                  ...page.inquiry,
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
    );
  }

  return (
    <StudioGroup
      eyebrow="Homepage"
      title="Homepage Signature Collection teaser"
      description="Controls the homepage block. Project cards come from your showcase projects."
    >
      <StudioFormGrid>
        <StudioField label="Eyebrow">
          <StudioInput
            value={homepageCopy.eyebrow}
            onChange={(event) => updateHomepageTeaser({ eyebrow: event.target.value })}
          />
        </StudioField>
        <StudioField label="Title">
          <StudioInput
            value={homepageCopy.title}
            onChange={(event) => updateHomepageTeaser({ title: event.target.value })}
          />
        </StudioField>
        <StudioField label="Action label">
          <StudioInput
            value={homepageCopy.actionLabel ?? ""}
            onChange={(event) => updateHomepageTeaser({ actionLabel: event.target.value })}
          />
        </StudioField>
        <StudioField label="Action link">
          <StudioInput
            value={homepageCopy.actionHref ?? ""}
            onChange={(event) => updateHomepageTeaser({ actionHref: event.target.value })}
          />
        </StudioField>
        <StudioField
          label="Homepage card count"
          hint="How many projects to show on the homepage teaser (not the full Signature page)."
        >
          <StudioInput
            type="number"
            min={1}
            value={homepageCopy.limit}
            onChange={(event) =>
              updateHomepageTeaser({
                limit: Number(event.target.value) || 4,
              })
            }
          />
        </StudioField>
      </StudioFormGrid>
      <StudioField label="Subtitle" fullWidth>
        <RichTextEditor
          value={homepageCopy.subtitle}
          onChange={(subtitle) => updateHomepageTeaser({ subtitle })}
          rows={2}
          compact
          showHint={false}
        />
      </StudioField>
    </StudioGroup>
  );
}
