"use client";

import {
  ImageUploadField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
  StudioSelect,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import type { SignatureProjectEditorStep } from "./SignatureEditorShell";
import type {
  SignatureProject,
  SignatureProjectStyle,
  SiteTestimonial,
} from "@/types/site-config";

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

export function SignatureProjectStepPanels({
  step,
  project,
  index,
  updateProject,
}: {
  step: SignatureProjectEditorStep;
  project: SignatureProject;
  index: number;
  updateProject: (index: number, patch: Partial<SignatureProject>) => void;
}) {
  if (step === "details") {
    return (
      <StudioGroup
        eyebrow="Step 1"
        title="Project details"
        description="Name and short summary shown on the grid and project page."
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
            rows={3}
            compact
            showHint={false}
          />
        </StudioField>
      </StudioGroup>
    );
  }

  if (step === "cover") {
    return (
      <StudioGroup
        eyebrow="Step 2"
        title="Cover photo"
        description="Used on the Signature Wall Art grid and homepage teaser."
      >
        <ImageUploadField
          label="Cover image"
          path={project.coverImageUrl}
          slug={`signature-project-${project.slug || index}`}
          kind="page"
          onUploaded={(path) => updateProject(index, { coverImageUrl: path })}
        />
        <StudioField
          label="Cover shape on site"
          hint="Vertical fits most paintings; choose Horizontal for wide photos."
          fullWidth
        >
          <StudioSelect
            value={project.coverOrientation ?? "portrait"}
            onChange={(event) =>
              updateProject(index, {
                coverOrientation:
                  event.target.value === "landscape" ? "landscape" : "portrait",
              })
            }
          >
            <option value="portrait">Vertical (tall frame)</option>
            <option value="landscape">Horizontal (wide frame)</option>
          </StudioSelect>
        </StudioField>
      </StudioGroup>
    );
  }

  if (step === "styles") {
    return (
      <StudioGroup
        eyebrow="Step 3"
        title="Design styles"
        description="Highlight finishes and design language on the project page."
      >
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
                        designStyles: moveItem(project.designStyles, styleIndex, -1),
                      })
                  : undefined
              }
              onMoveDown={
                styleIndex < project.designStyles.length - 1
                  ? () =>
                      updateProject(index, {
                        designStyles: moveItem(project.designStyles, styleIndex, 1),
                      })
                  : undefined
              }
              onRemove={() =>
                updateProject(index, {
                  designStyles: project.designStyles.filter((_, i) => i !== styleIndex),
                })
              }
            >
              <StudioField label="Title">
                <StudioInput
                  value={style.title}
                  onChange={(event) => {
                    const designStyles = [...project.designStyles];
                    designStyles[styleIndex] = { ...style, title: event.target.value };
                    updateProject(index, { designStyles });
                  }}
                />
              </StudioField>
              <StudioField label="Description" fullWidth>
                <RichTextEditor
                  value={style.description}
                  onChange={(description) => {
                    const designStyles = [...project.designStyles];
                    designStyles[styleIndex] = { ...style, description };
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
      </StudioGroup>
    );
  }

  if (step === "gallery") {
    return (
      <StudioGroup
        eyebrow="Step 4"
        title="Gallery photos"
        description="Process and detail shots at the end of the project page."
      >
        <StudioRepeaterHeader
          title="Gallery images"
          addLabel="Add gallery image"
          onAdd={() =>
            updateProject(index, {
              galleryImages: [...project.galleryImages, ""],
            })
          }
        />
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
                        galleryImages: moveItem(project.galleryImages, imageIndex, -1),
                      })
                  : undefined
              }
              onMoveDown={
                imageIndex < project.galleryImages.length - 1
                  ? () =>
                      updateProject(index, {
                        galleryImages: moveItem(project.galleryImages, imageIndex, 1),
                      })
                  : undefined
              }
              onRemove={() =>
                updateProject(index, {
                  galleryImages: project.galleryImages.filter((_, i) => i !== imageIndex),
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
      </StudioGroup>
    );
  }

  return (
    <StudioGroup
      eyebrow="Step 5"
      title="Client quotes"
      description="Optional testimonials on the project page."
    >
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
                      testimonials: moveItem(project.testimonials, itemIndex, -1),
                    })
                : undefined
            }
            onMoveDown={
              itemIndex < project.testimonials.length - 1
                ? () =>
                    updateProject(index, {
                      testimonials: moveItem(project.testimonials, itemIndex, 1),
                    })
                : undefined
            }
            onRemove={() =>
              updateProject(index, {
                testimonials: project.testimonials.filter((_, i) => i !== itemIndex),
              })
            }
          >
            <StudioField label="Quote" fullWidth>
              <RichTextEditor
                value={item.quote}
                onChange={(quote) => {
                  const testimonials = [...project.testimonials];
                  testimonials[itemIndex] = { ...item, quote };
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
                    testimonials[itemIndex] = { ...item, name: event.target.value };
                    updateProject(index, { testimonials });
                  }}
                />
              </StudioField>
              <StudioField label="Role">
                <StudioInput
                  value={item.role}
                  onChange={(event) => {
                    const testimonials = [...project.testimonials];
                    testimonials[itemIndex] = { ...item, role: event.target.value };
                    updateProject(index, { testimonials });
                  }}
                />
              </StudioField>
            </StudioFormGrid>
          </StudioRepeaterItem>
        ))}
      </div>
    </StudioGroup>
  );
}
