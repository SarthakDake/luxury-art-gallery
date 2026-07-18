"use client";

import {
  ImageUploadField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioSection,
  StudioShell,
  StudioTextarea,
} from "./shared";
import type { StudioPreviewTarget } from "./preview-targets";
import type { CuratedWorksCopy, SiteConfig } from "@/types/site-config";

type CuratedPageKey = "signatureWallArt" | "portfolio";

export function CuratedPageTab({
  config,
  pageKey,
  title,
  subtitle,
  onChange,
  onRequestPreview,
}: {
  config: SiteConfig;
  pageKey: CuratedPageKey;
  title: string;
  subtitle: string;
  onChange: (config: SiteConfig) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  const copy = config.homepage[pageKey];
  const isSignaturePage = pageKey === "signatureWallArt";

  function updateCopy(patch: Partial<CuratedWorksCopy>) {
    onChange({
      ...config,
      homepage: {
        ...config.homepage,
        [pageKey]: { ...copy, ...patch },
      },
    });
  }

  return (
    <StudioShell>
      <StudioSection
        title={title}
        subtitle={subtitle}
        onPreview={() =>
          onRequestPreview?.({
            scope: "site",
            region: "homepage",
            label: `${title} on homepage`,
          })
        }
      >
        {isSignaturePage ? (
          <StudioGroup
            eyebrow="Page hero"
            title="Large image"
            description="Full-width image at the top of the Signature Wall Art page."
          >
            <ImageUploadField
              label="Large page image"
              path={copy.pageImageUrl}
              slug="signature-page-hero"
              kind="page"
              onUploaded={(path) => updateCopy({ pageImageUrl: path })}
              hint="Upload a wide statement image for the top of the Signature Wall Art page."
            />
          </StudioGroup>
        ) : null}

        <StudioGroup
          eyebrow={isSignaturePage ? "Introduction" : "Page & section"}
          title={isSignaturePage ? "Small introduction" : "Headings & supporting copy"}
          description={
            isSignaturePage
              ? "Short copy shown under the large image, before the project grid."
              : "These fields power both the dedicated page and the matching homepage section."
          }
        >
          <StudioFormGrid>
            <StudioField label="Eyebrow">
              <StudioInput
                value={copy.eyebrow}
                onChange={(event) => updateCopy({ eyebrow: event.target.value })}
              />
            </StudioField>
            <StudioField label="Title">
              <StudioInput
                value={copy.title}
                onChange={(event) => updateCopy({ title: event.target.value })}
              />
            </StudioField>
          </StudioFormGrid>
          {isSignaturePage ? (
            <StudioField label="Introduction">
              <StudioTextarea
                rows={3}
                value={copy.pageIntro}
                onChange={(event) => updateCopy({ pageIntro: event.target.value })}
              />
            </StudioField>
          ) : (
            <StudioField label="Subtitle">
              <StudioTextarea
                rows={3}
                value={copy.subtitle}
                onChange={(event) => updateCopy({ subtitle: event.target.value })}
              />
            </StudioField>
          )}
        </StudioGroup>

        <StudioGroup
          eyebrow="Projects"
          title={isSignaturePage ? "Premium project grid" : "Which works to show"}
        >
          <StudioFormGrid>
            <StudioField label="Category filter">
              <StudioInput
                value={copy.categoryFilter}
                placeholder="e.g. Ready to hang, Abstract"
                onChange={(event) =>
                  updateCopy({ categoryFilter: event.target.value })
                }
              />
            </StudioField>
            {isSignaturePage ? (
              <StudioField label="Projects on page">
                <StudioInput
                  type="number"
                  min={1}
                  max={12}
                  value={copy.pageLimit}
                  onChange={(event) =>
                    updateCopy({ pageLimit: Number(event.target.value) || 6 })
                  }
                />
              </StudioField>
            ) : null}
            <StudioField label="Homepage count">
              <StudioInput
                type="number"
                min={1}
                value={copy.limit}
                onChange={(event) =>
                  updateCopy({ limit: Number(event.target.value) || 4 })
                }
              />
            </StudioField>
            {!isSignaturePage ? (
              <>
                <StudioField label="Action label">
                  <StudioInput
                    value={copy.actionLabel ?? ""}
                    onChange={(event) =>
                      updateCopy({ actionLabel: event.target.value })
                    }
                  />
                </StudioField>
                <StudioField label="Action link">
                  <StudioInput
                    value={copy.actionHref ?? ""}
                    onChange={(event) =>
                      updateCopy({ actionHref: event.target.value })
                    }
                  />
                </StudioField>
              </>
            ) : null}
          </StudioFormGrid>
          <p className="studio-field-hint">
            Category filter matches category, subcategory, or title. Leave blank
            to include all works.
            {isSignaturePage
              ? " The page grid defaults to 6 premium projects."
              : ""}
          </p>
        </StudioGroup>

        {isSignaturePage ? (
          <>
            <StudioGroup
              eyebrow="Page CTA"
              title="View Portfolio"
              description="Button under the grid. Defaults to the For Interior Designers page."
            >
              <StudioFormGrid>
                <StudioField label="Button label">
                  <StudioInput
                    value={copy.pageCtaLabel}
                    onChange={(event) =>
                      updateCopy({ pageCtaLabel: event.target.value })
                    }
                  />
                </StudioField>
                <StudioField label="Button link">
                  <StudioInput
                    value={copy.pageCtaHref}
                    onChange={(event) =>
                      updateCopy({ pageCtaHref: event.target.value })
                    }
                  />
                </StudioField>
              </StudioFormGrid>
            </StudioGroup>

            <StudioGroup
              eyebrow="Homepage section"
              title="Homepage Signature Collection teaser"
              description="Optional — controls the matching homepage section only."
            >
              <StudioFormGrid>
                <StudioField label="Homepage subtitle">
                  <StudioInput
                    value={copy.subtitle}
                    onChange={(event) =>
                      updateCopy({ subtitle: event.target.value })
                    }
                  />
                </StudioField>
                <StudioField label="Homepage action label">
                  <StudioInput
                    value={copy.actionLabel ?? ""}
                    onChange={(event) =>
                      updateCopy({ actionLabel: event.target.value })
                    }
                  />
                </StudioField>
                <StudioField label="Homepage action link">
                  <StudioInput
                    value={copy.actionHref ?? ""}
                    onChange={(event) =>
                      updateCopy({ actionHref: event.target.value })
                    }
                  />
                </StudioField>
              </StudioFormGrid>
            </StudioGroup>
          </>
        ) : null}
      </StudioSection>
    </StudioShell>
  );
}
