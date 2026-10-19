"use client";

import { SignaturePageSettingsPanels } from "./SignaturePageSettingsPanels";
import { SignatureProjectStepPanels } from "./SignatureProjectStepPanels";
import {
  SignaturePageStepNav,
  SignatureProjectEditorHero,
  SignatureProjectSidebar,
  SignatureProjectStepNav,
  SignatureStepPanel,
  type SignaturePageSettingsStep,
  type SignatureProjectEditorStep,
} from "./SignatureEditorShell";
import { StudioEmptyState, StudioShell, StudioStepFooter } from "./shared";
import type { StudioPreviewTarget } from "./preview-targets";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { useState } from "react";
import type {
  SignatureProject,
  SignatureWallArtPageConfig,
  SiteConfig,
} from "@/types/site-config";

type StudioMode = "projects" | "page";

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

function createEmptyProject(items: SignatureProject[]): SignatureProject {
  return {
    slug: `project-${items.length + 1}`,
    title: "New project",
    summary: "",
    coverImageUrl: "",
    coverOrientation: "portrait",
    designStyles: [],
    galleryImages: [],
    testimonials: [],
  };
}

const PROJECT_STEP_ORDER: SignatureProjectEditorStep[] = [
  "details",
  "cover",
  "styles",
  "gallery",
  "testimonials",
];

const PROJECT_STEP_TITLES: Record<
  SignatureProjectEditorStep,
  { title: string; lead: string; previewRegion: "projects" | "page" }
> = {
  details: {
    title: "Project details",
    lead: "Title, URL, and summary for this showcase wall.",
    previewRegion: "projects",
  },
  cover: {
    title: "Cover photo",
    lead: "Main image and vertical or horizontal framing.",
    previewRegion: "projects",
  },
  styles: {
    title: "Design styles",
    lead: "Finishes and design language on the project page.",
    previewRegion: "projects",
  },
  gallery: {
    title: "Gallery photos",
    lead: "Extra process and detail shots.",
    previewRegion: "projects",
  },
  testimonials: {
    title: "Client quotes",
    lead: "Optional testimonials for this project.",
    previewRegion: "projects",
  },
};

const PAGE_STEP_TITLES: Record<
  SignaturePageSettingsStep,
  {
    title: string;
    lead: string;
    previewRegion: Extract<StudioPreviewTarget, { scope: "signature" }>["region"];
  }
> = {
  layout: { title: "Page layout", lead: "Order of sections on Signature Wall Art.", previewRegion: "page" },
  hero: { title: "Hero & intro", lead: "Banner and introduction at the top of the page.", previewRegion: "page" },
  grid: { title: "Projects grid copy", lead: "Heading above the showcase cards.", previewRegion: "projects" },
  process: { title: "Process", lead: "Steps for custom wall art.", previewRegion: "process" },
  faq: { title: "FAQ", lead: "Common questions.", previewRegion: "faq" },
  enquiry: { title: "Enquiry", lead: "Form and WhatsApp CTAs.", previewRegion: "enquiry" },
  homepage: { title: "Homepage teaser", lead: "Signature Collection block on the homepage.", previewRegion: "homepage" },
};

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
  const projects = page.projects.items;

  const [studioMode, setStudioMode] = useState<StudioMode>("projects");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projectStep, setProjectStep] = useState<SignatureProjectEditorStep>("details");
  const [pageStep, setPageStep] = useState<SignaturePageSettingsStep>("layout");

  const projectIndex =
    projects.length === 0 ? 0 : Math.min(selectedIndex, projects.length - 1);
  const selectedProject = projects[projectIndex] ?? null;

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

  function addProject() {
    const items = [...page.projects.items, createEmptyProject(page.projects.items)];
    updatePage({ projects: { ...page.projects, items } });
    setSelectedIndex(items.length - 1);
    setProjectStep("details");
    setStudioMode("projects");
  }

  function removeProject(index: number) {
    const items = page.projects.items.filter((_, i) => i !== index);
    updatePage({ projects: { ...page.projects, items } });
    setSelectedIndex(Math.max(0, index - 1));
  }

  return (
    <StudioShell>
      <div className="studio-signature-mode-nav" role="tablist" aria-label="Signature Wall Art editor">
        <button
          type="button"
          role="tab"
          aria-selected={studioMode === "projects"}
          className={`studio-signature-mode-btn${studioMode === "projects" ? " studio-signature-mode-btn--active" : ""}`}
          onClick={() => setStudioMode("projects")}
        >
          Edit projects
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={studioMode === "page"}
          className={`studio-signature-mode-btn${studioMode === "page" ? " studio-signature-mode-btn--active" : ""}`}
          onClick={() => setStudioMode("page")}
        >
          Page & enquiry
        </button>
      </div>

      {studioMode === "projects" ? (
        projects.length === 0 ? (
          <StudioEmptyState
            title="Add your first showcase project"
            description="Each project gets its own detail page on Signature Wall Art. Add as many walls as you like — there is no fixed limit."
            actionLabel="Add first project"
            onAction={addProject}
          />
        ) : (
          <div className="studio-artworks-layout">
            <SignatureProjectSidebar
              projects={projects}
              selectedIndex={projectIndex}
              onSelect={(index) => {
                setSelectedIndex(index);
                setProjectStep("details");
              }}
              onAdd={addProject}
            />

            <div className="studio-artworks-editor">
              {selectedProject ? (
                <>
                  <SignatureProjectEditorHero
                    project={selectedProject}
                    onDelete={() => removeProject(projectIndex)}
                  />

                  <SignatureProjectStepNav activeStep={projectStep} onChange={setProjectStep} />

                  {PROJECT_STEP_ORDER.map((step, stepIndex) => {
                    const meta = PROJECT_STEP_TITLES[step];
                    const prevStep = PROJECT_STEP_ORDER[stepIndex - 1];
                    const nextStep = PROJECT_STEP_ORDER[stepIndex + 1];
                    return (
                      <SignatureStepPanel
                        key={step}
                        step={step}
                        activeStep={projectStep}
                        title={meta.title}
                        lead={meta.lead}
                        onPreview={() =>
                          preview(meta.previewRegion, `Signature project — ${meta.title}`)
                        }
                      >
                        <SignatureProjectStepPanels
                          step={step}
                          project={selectedProject}
                          index={projectIndex}
                          updateProject={updateProject}
                        />
                        <StudioStepFooter
                          back={
                            prevStep
                              ? {
                                  label: "Back",
                                  onClick: () => setProjectStep(prevStep),
                                }
                              : undefined
                          }
                          primary={
                            nextStep
                              ? {
                                  label:
                                    nextStep === "cover"
                                      ? "Continue to cover"
                                      : nextStep === "styles"
                                        ? "Continue to styles"
                                        : nextStep === "gallery"
                                          ? "Continue to gallery"
                                          : "Continue to quotes",
                                  onClick: () => setProjectStep(nextStep),
                                }
                              : {
                                  label: "Finish editing",
                                  onClick: () => setProjectStep("details"),
                                }
                          }
                        />
                      </SignatureStepPanel>
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>
        )
      ) : (
        <div className="studio-artworks-editor studio-artworks-editor--solo">
          <SignaturePageStepNav activeStep={pageStep} onChange={setPageStep} />

          {(Object.keys(PAGE_STEP_TITLES) as SignaturePageSettingsStep[]).map((step) => {
            const meta = PAGE_STEP_TITLES[step];
            return (
              <SignatureStepPanel
                key={step}
                step={step}
                activeStep={pageStep}
                title={meta.title}
                lead={meta.lead}
                onPreview={() => preview(meta.previewRegion, `Signature Wall Art — ${meta.title}`)}
              >
                <SignaturePageSettingsPanels
                  step={step}
                  page={page}
                  homepageCopy={homepageCopy}
                  updatePage={updatePage}
                  updateHomepageTeaser={updateHomepageTeaser}
                  moveSection={moveSection}
                />
              </SignatureStepPanel>
            );
          })}
        </div>
      )}
    </StudioShell>
  );
}
