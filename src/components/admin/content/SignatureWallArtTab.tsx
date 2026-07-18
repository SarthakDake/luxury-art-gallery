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
  StudioTextarea,
} from "./shared";
import type { StudioPreviewTarget } from "./preview-targets";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import type {
  SignatureFaqItem,
  SignatureProject,
  SignatureProjectStyle,
  SignatureWallArtPageConfig,
  SiteConfig,
  SiteTestimonial,
  TradeProcessStep,
} from "@/types/site-config";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

  return (
    <StudioShell>
      <StudioSection
        title="Signature Wall Art"
        subtitle="Showcase page"
        onPreview={() =>
          onRequestPreview?.({
            scope: "site",
            region: "homepage",
            label: "Signature Wall Art homepage teaser",
          })
        }
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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={page.intro.subtitle}
              onChange={(event) =>
                updatePage({
                  intro: { ...page.intro, subtitle: event.target.value },
                })
              }
            />
          </StudioField>
        </StudioGroup>

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
          <StudioField label="Section subtitle">
            <StudioTextarea
              rows={2}
              value={page.projects.subtitle}
              onChange={(event) =>
                updatePage({
                  projects: { ...page.projects, subtitle: event.target.value },
                })
              }
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
                <StudioField label="Short summary">
                  <StudioTextarea
                    rows={2}
                    value={project.summary}
                    onChange={(event) =>
                      updateProject(index, { summary: event.target.value })
                    }
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
                      <StudioField label="Description">
                        <StudioTextarea
                          rows={2}
                          value={style.description}
                          onChange={(event) => {
                            const designStyles = [...project.designStyles];
                            designStyles[styleIndex] = {
                              ...style,
                              description: event.target.value,
                            };
                            updateProject(index, { designStyles });
                          }}
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

                <StudioField
                  label="Gallery images (one path per line)"
                  hint="Shown as 3–4 images in a row at the end of the project page."
                >
                  <StudioTextarea
                    rows={3}
                    value={project.galleryImages.join("\n")}
                    onChange={(event) =>
                      updateProject(index, {
                        galleryImages: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </StudioField>

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
                      onRemove={() =>
                        updateProject(index, {
                          testimonials: project.testimonials.filter(
                            (_, i) => i !== itemIndex,
                          ),
                        })
                      }
                    >
                      <StudioField label="Quote">
                        <StudioTextarea
                          rows={2}
                          value={item.quote}
                          onChange={(event) => {
                            const testimonials = [...project.testimonials];
                            testimonials[itemIndex] = {
                              ...item,
                              quote: event.target.value,
                            };
                            updateProject(index, { testimonials });
                          }}
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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={2}
              value={page.process.subtitle}
              onChange={(event) =>
                updatePage({
                  process: { ...page.process, subtitle: event.target.value },
                })
              }
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
                <StudioField label="Description">
                  <StudioTextarea
                    rows={2}
                    value={step.description}
                    onChange={(event) => {
                      const steps = [...page.process.steps];
                      steps[index] = { ...step, description: event.target.value };
                      updatePage({ process: { ...page.process, steps } });
                    }}
                  />
                </StudioField>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={2}
              value={page.faq.subtitle}
              onChange={(event) =>
                updatePage({
                  faq: { ...page.faq, subtitle: event.target.value },
                })
              }
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
                <StudioField label="Answer">
                  <StudioTextarea
                    rows={3}
                    value={item.answer}
                    onChange={(event) => {
                      const items = [...page.faq.items];
                      items[index] = { ...item, answer: event.target.value };
                      updatePage({ faq: { ...page.faq, items } });
                    }}
                  />
                </StudioField>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>

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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={2}
              value={page.inquiry.subtitle}
              onChange={(event) =>
                updatePage({
                  inquiry: { ...page.inquiry, subtitle: event.target.value },
                })
              }
            />
          </StudioField>
          <StudioField label="Success message">
            <StudioTextarea
              rows={2}
              value={page.inquiry.successMessage}
              onChange={(event) =>
                updatePage({
                  inquiry: {
                    ...page.inquiry,
                    successMessage: event.target.value,
                  },
                })
              }
            />
          </StudioField>
        </StudioGroup>

        <StudioGroup
          eyebrow="Homepage"
          title="Homepage Signature Collection teaser"
          description="Optional — controls only the matching homepage section (shop artworks grid)."
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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={2}
              value={homepageCopy.subtitle}
              onChange={(event) =>
                updateHomepageTeaser({ subtitle: event.target.value })
              }
            />
          </StudioField>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
