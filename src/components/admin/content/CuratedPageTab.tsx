"use client";

import {
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
        <StudioGroup
          eyebrow="Page & section"
          title="Headings & supporting copy"
          description="These fields power both the dedicated page and the matching homepage section."
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
          <StudioField label="Subtitle">
            <StudioTextarea
              rows={3}
              value={copy.subtitle}
              onChange={(event) => updateCopy({ subtitle: event.target.value })}
            />
          </StudioField>
        </StudioGroup>

        <StudioGroup eyebrow="Collection" title="Which works to show">
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
          </StudioFormGrid>
          <p className="studio-field-hint">
            Category filter matches category, subcategory, or title. Leave blank
            to include all works. The dedicated page shows a larger selection.
          </p>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
