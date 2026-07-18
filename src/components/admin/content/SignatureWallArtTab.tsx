"use client";

import {
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
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import type {
  SignatureFaqItem,
  SignaturePageSectionId,
  SignatureProject,
  SignatureProjectStyle,
  SignatureWallArtPageConfig,
  SiteConfig,
  SiteTestimonial,
  TradeProcessStep,
} from "@/types/site-config";

const SECTION_LABELS: Record<SignaturePageSectionId, string> = {
  projects: "Projects grid",
  process: "Our process",
  faq: "FAQ",
  inquiry: "Inquiry form",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

export function SignatureWallArtTab({
  config,
  onChange,
  onRequestPreview,
}: {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  const page: SignatureWallArtPageConfig =
    config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;
  const homepageCopy = config.homepage.signatureWallArt;

  function preview(
    region: Extract<StudioPreviewTarget, { scope: "signature" }>["region"],
    label: string,
  ) {
    onRequestPreview?.({ scope: "signature", region, label });
  }

  function commitPage(next: SignatureWallArtPageConfig) {
    onChange({
      ...config,
      signatureWallArtPage: next,
    });
  }

  function updatePage(patch: Partial<SignatureWallArtPageConfig>) {
    commitPage({ ...page, ...patch });
  }

  function updateProject(index: number, patch: Partial<SignatureProject>) {
    const items = [...page.projects.items];
    items[index] = { ...items[index], ...patch };
    updatePage({ projects: { ...page.projects, items } });
  }

  function updateHomepageTeaser(patch: Partial<typeof homepageCopy>) {
    onChange({
      ...config,
      homepage: {
        ...config.homepage,
        signatureWallArt: { ...homepageCopy, ...patch },
      },
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    updatePage({
      sectionOrder: moveItem(page.sectionOrder, index, direction),
    });
  }

  return (
    <StudioShell>
      <StudioSection
        title="Page structure"
        subtitle="Order of sections on Signature Wall Art"
        onPreview={() => preview("page", "Signature Wall Art page")}
      >
        <StudioGroup
          eyebrow="Page order"
          title="Shuffle sections on the page"
          description="Hero and intro stay at the top. Move Projects, Process, FAQ, and Inquiry up or down."
        >
          <div className="studio-repeater-list">
            {page.sectionOrder.map((sectionId, index) => (
              <StudioRepeaterItem
                key={sectionId}
                index={index}
                title={SECTION_LABELS[sectionId]}
                showRemove={false}
                onMoveUp={
                  index > 0 ? () => moveSection(index, -1) : undefined
                }
                onMoveDown={
                  index < page.sectionOrder.length - 1
                    ? () => moveSection(index, 1)
                    : undefined
                }
              >
                <p className="studio-field-hint">
                  Use the arrows to change where this block appears on the live
                  Signature Wall Art page.
                </p>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Hero & Intro"
        subtitle="Top of the Signature Wall Art page"
        onPreview={() => preview("page", "Signature Wall Art — hero & intro")}
      >
        <StudioGroup
          eyebrow="Hero Banner"
          title="Page hero image"
          description="Full-width image at the top of /signature-wall-art."
        >
          <ImageUploadField
            label="Hero image"
            path={page.hero.imageUrl}
            slug="signature-page-hero"
            kind="page"
            onUploaded={(path) =>
              updatePage({ hero: { ...page.hero, imageUrl: path } })
            }
          />
        </StudioGroup>

        <StudioGroup eyebrow="Introduction" title="Signature Wall Art intro">
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
      </StudioSection>

      <StudioSection
        title="Projects"
        subtitle="Showcase project grid"
        onPreview={() => preview("projects", "Signature Wall Art — projects")}
      >
        <StudioGroup
          eyebrow="Projects"
          title="Showcase projects"
          description="These are showcase projects (not shop products). Each opens its own detail page."
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

          <StudioRepeaterHeader
            title="Projects"
            addLabel="Add project"
            onAdd={() => {
              const items: SignatureProject[] = [
                ...page.projects.items,
                {
                  slug: `project-${page.projects.items.length + 1}`,
                  title: "New project",
                  summary: "",
                  coverImageUrl: "",
                  designStyles: [],
                  galleryImages: [],
                  testimonials: [],
                },
              ];
              updatePage({ projects: { ...page.projects, items } });
            }}
          />

          <div className="studio-repeater-list">
            {page.projects.items.map((project, index) => (
              <StudioRepeaterItem
                key={project.slug || `project-${index}`}
                index={index}
                title={project.title || `Project ${index + 1}`}
                removeLabel="Remove project"
                onMoveUp={
                  index > 0
                    ? () =>
                        updatePage({
                          projects: {
                            ...page.projects,
                            items: moveItem(page.projects.items, index, -1),
                          },
                        })
                    : undefined
                }
                onMoveDown={
                  index < page.projects.items.length - 1
                    ? () =>
                        updatePage({
                          projects: {
                            ...page.projects,
                            items: moveItem(page.projects.items, index, 1),
                          },
                        })
                    : undefined
                }
                onRemove={() =>
                  updatePage({
                    projects: {
                      ...page.projects,
                      items: page.projects.items.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Title">
                    <StudioInput
                      value={project.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        updateProject(index, {
                          title,
                          slug: project.slug || slugify(title) || `project-${index + 1}`,
                        });
                      }}
                    />
                  </StudioField>
                  <StudioField label="URL slug">
                    <StudioInput
                      value={project.slug}
                      onChange={(event) =>
                        updateProject(index, {
                          slug: slugify(event.target.value) || project.slug,
                        })
                      }
                    />
                  </StudioField>
                </StudioFormGrid>
                <StudioField label="Short summary" fullWidth>
                  <RichTextEditor
                    value={project.summary}
                    onChange={(summary) => updateProject(index, { summary })}
                    rows={2}
                    compact
                    showHint={false}
                  />
                </StudioField>
                <ImageUploadField
                  label="Cover image"
                  path={project.coverImageUrl}
                  slug={`signature-project-${project.slug || index}`}
                  kind="page"
                  onUploaded={(path) =>
                    updateProject(index, { coverImageUrl: path })
                  }
                />

                <StudioRepeaterHeader
                  title="Design styles"
                  addLabel="Add style"
                  onAdd={() => {
                    const designStyles: SignatureProjectStyle[] = [
                      ...project.designStyles,
                      { imageUrl: "", title: "New style", description: "" },
                    ];
                    updateProject(index, { designStyles });
                  }}
                />
                <div className="studio-repeater-list">
                  {project.designStyles.map((style, styleIndex) => (
                    <StudioRepeaterItem
                      key={`style-${index}-${styleIndex}`}
                      index={styleIndex}
                      title={style.title || `Style ${styleIndex + 1}`}
                      removeLabel="Remove style"
                      onMoveUp={
                        styleIndex > 0
                          ? () =>
                              updateProject(index, {
                                designStyles: moveItem(
                                  project.designStyles,
                                  styleIndex,
                                  -1,
                                ),
                              })
                          : undefined
                      }
                      onMoveDown={
                        styleIndex < project.designStyles.length - 1
                          ? () =>
                              updateProject(index, {
                                designStyles: moveItem(
                                  project.designStyles,
                                  styleIndex,
                                  1,
                                ),
                              })
                          : undefined
                      }
                      onRemove={() =>
                        updateProject(index, {
                          designStyles: project.designStyles.filter(
                            (_, i) => i !== styleIndex,
                          ),
                        })
                      }
                    >
                      <StudioField label="Title">
                        <StudioInput
                          value={style.title}
                          onChange={(event) => {
                            const designStyles = [...project.designStyles];
                            designStyles[styleIndex] = {
                              ...style,
                              title: event.target.value,
                            };
                            updateProject(index, { designStyles });
                          }}
                        />
                      </StudioField>
                      <StudioField label="Description" fullWidth>
                        <RichTextEditor
                          value={style.description}
                          onChange={(description) => {
                            const designStyles = [...project.designStyles];
                            designStyles[styleIndex] = {
                              ...style,
                              description,
                            };
                            updateProject(index, { designStyles });
                          }}
                          rows={2}
                          compact
                          showHint={false}
                        />
                      </StudioField>
                      <ImageUploadField
                        label="Style image"
                        path={style.imageUrl}
                        slug={`signature-style-${project.slug || index}-${styleIndex}`}
                        kind="page"
                        onUploaded={(path) => {
                          const designStyles = [...project.designStyles];
                          designStyles[styleIndex] = { ...style, imageUrl: path };
                          updateProject(index, { designStyles });
                        }}
                      />
                    </StudioRepeaterItem>
                  ))}
                </div>

                <StudioRepeaterHeader
                  title="Gallery images"
                  addLabel="Add gallery image"
                  onAdd={() =>
                    updateProject(index, {
                      galleryImages: [...project.galleryImages, ""],
                    })
                  }
                />
                <p className="studio-field-hint">
                  Shown as a row of images at the end of the project page. Use
                  arrows to shuffle order.
                </p>
                <div className="studio-repeater-list">
                  {project.galleryImages.map((imageUrl, imageIndex) => (
                    <StudioRepeaterItem
                      key={`gallery-${index}-${imageIndex}`}
                      index={imageIndex}
                      title={`Gallery image ${imageIndex + 1}`}
                      removeLabel="Remove gallery image"
                      onMoveUp={
                        imageIndex > 0
                          ? () =>
                              updateProject(index, {
                                galleryImages: moveItem(
                                  project.galleryImages,
                                  imageIndex,
                                  -1,
                                ),
                              })
                          : undefined
                      }
                      onMoveDown={
                        imageIndex < project.galleryImages.length - 1
                          ? () =>
                              updateProject(index, {
                                galleryImages: moveItem(
                                  project.galleryImages,
                                  imageIndex,
                                  1,
                                ),
                              })
                          : undefined
                      }
                      onRemove={() =>
                        updateProject(index, {
                          galleryImages: project.galleryImages.filter(
                            (_, i) => i !== imageIndex,
                          ),
                        })
                      }
                    >
                      <ImageUploadField
                        label="Image"
                        path={imageUrl}
                        slug={`signature-gallery-${project.slug || index}-${imageIndex}`}
                        kind="page"
                        onUploaded={(path) => {
                          const galleryImages = [...project.galleryImages];
                          galleryImages[imageIndex] = path;
                          updateProject(index, { galleryImages });
                        }}
                      />
                    </StudioRepeaterItem>
                  ))}
                </div>

                <StudioRepeaterHeader
                  title="Project testimonials"
                  addLabel="Add testimonial"
                  onAdd={() => {
                    const testimonials: SiteTestimonial[] = [
                      ...project.testimonials,
                      { quote: "", name: "", role: "" },
                    ];
                    updateProject(index, { testimonials });
                  }}
                />
                <div className="studio-repeater-list">
                  {project.testimonials.map((item, itemIndex) => (
                    <StudioRepeaterItem
                      key={`testimonial-${index}-${itemIndex}`}
                      index={itemIndex}
                      title={item.name || `Testimonial ${itemIndex + 1}`}
                      removeLabel="Remove testimonial"
                      onMoveUp={
                        itemIndex > 0
                          ? () =>
                              updateProject(index, {
                                testimonials: moveItem(
                                  project.testimonials,
                                  itemIndex,
                                  -1,
                                ),
                              })
                          : undefined
                      }
                      onMoveDown={
                        itemIndex < project.testimonials.length - 1
                          ? () =>
                              updateProject(index, {
                                testimonials: moveItem(
                                  project.testimonials,
                                  itemIndex,
                                  1,
                                ),
                              })
                          : undefined
                      }
                      onRemove={() =>
                        updateProject(index, {
                          testimonials: project.testimonials.filter(
                            (_, i) => i !== itemIndex,
                          ),
                        })
                      }
                    >
                      <StudioField label="Quote" fullWidth>
                        <RichTextEditor
                          value={item.quote}
                          onChange={(quote) => {
                            const testimonials = [...project.testimonials];
                            testimonials[itemIndex] = {
                              ...item,
                              quote,
                            };
                            updateProject(index, { testimonials });
                          }}
                          rows={2}
                          compact
                          showHint={false}
                        />
                      </StudioField>
                      <StudioFormGrid>
                        <StudioField label="Name">
                          <StudioInput
                            value={item.name}
                            onChange={(event) => {
                              const testimonials = [...project.testimonials];
                              testimonials[itemIndex] = {
                                ...item,
                                name: event.target.value,
                              };
                              updateProject(index, { testimonials });
                            }}
                          />
                        </StudioField>
                        <StudioField label="Role">
                          <StudioInput
                            value={item.role}
                            onChange={(event) => {
                              const testimonials = [...project.testimonials];
                              testimonials[itemIndex] = {
                                ...item,
                                role: event.target.value,
                              };
                              updateProject(index, { testimonials });
                            }}
                          />
                        </StudioField>
                      </StudioFormGrid>
                    </StudioRepeaterItem>
                  ))}
                </div>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Process"
        subtitle="Steps for statement wall art"
        onPreview={() => preview("process", "Signature Wall Art — process")}
      >
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
            {page.process.steps.map((step, index) => (
              <StudioRepeaterItem
                key={`process-${index}`}
                index={index}
                title={step.title || `Step ${index + 1}`}
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
                    value={step.title}
                    onChange={(event) => {
                      const steps = [...page.process.steps];
                      steps[index] = { ...step, title: event.target.value };
                      updatePage({ process: { ...page.process, steps } });
                    }}
                  />
                </StudioField>
                <StudioField label="Description" fullWidth>
                  <RichTextEditor
                    value={step.description}
                    onChange={(description) => {
                      const steps = [...page.process.steps];
                      steps[index] = { ...step, description };
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
      </StudioSection>

      <StudioSection
        title="FAQ"
        subtitle="Questions about statement wall arts"
        onPreview={() => preview("faq", "Signature Wall Art — FAQ")}
      >
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
      </StudioSection>

      <StudioSection
        title="Inquiry"
        subtitle="Form & WhatsApp CTAs"
        onPreview={() => preview("inquiry", "Signature Wall Art — inquiry")}
      >
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
      </StudioSection>

      <StudioSection
        title="Homepage teaser"
        subtitle="Signature Collection block on the homepage"
        onPreview={() => preview("homepage", "Signature Wall Art homepage teaser")}
      >
        <StudioGroup
          eyebrow="Homepage"
          title="Homepage Signature Collection teaser"
          description="Optional — controls the homepage Signature Collection teaser. Project cards come from the showcase projects above."
        >
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={homepageCopy.eyebrow}
                onChange={(event) =>
                  updateHomepageTeaser({ eyebrow: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={homepageCopy.title}
                onChange={(event) =>
                  updateHomepageTeaser({ title: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Action label">
              <StudioInput
                value={homepageCopy.actionLabel ?? ""}
                onChange={(event) =>
                  updateHomepageTeaser({ actionLabel: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Action link">
              <StudioInput
                value={homepageCopy.actionHref ?? ""}
                onChange={(event) =>
                  updateHomepageTeaser({ actionHref: event.target.value })
                }
              />
            </StudioField>
            <StudioField label="Homepage count">
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
      </StudioSection>
    </StudioShell>
  );
}
