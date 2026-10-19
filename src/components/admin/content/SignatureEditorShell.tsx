"use client";

import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { resolveSignatureCoverOrientation } from "@/lib/signature-cover";
import type { SignatureProject } from "@/types/site-config";
import {
  Eye,
  ImageIcon,
  Layers,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

export type SignatureProjectEditorStep =
  | "details"
  | "cover"
  | "styles"
  | "gallery"
  | "testimonials";

export const SIGNATURE_PROJECT_STEPS: {
  id: SignatureProjectEditorStep;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}[] = [
  { id: "details", label: "Details", hint: "Name & summary", icon: Sparkles },
  { id: "cover", label: "Cover", hint: "Photo & shape", icon: ImageIcon },
  { id: "styles", label: "Styles", hint: "Design styles", icon: Layers },
  { id: "gallery", label: "Gallery", hint: "Process photos", icon: ImageIcon },
  {
    id: "testimonials",
    label: "Quotes",
    hint: "Client notes",
    icon: MessageSquareQuote,
  },
];

export type SignaturePageSettingsStep =
  | "layout"
  | "hero"
  | "grid"
  | "process"
  | "faq"
  | "inquiry"
  | "homepage";

export const SIGNATURE_PAGE_STEPS: {
  id: SignaturePageSettingsStep;
  label: string;
  hint: string;
}[] = [
  { id: "layout", label: "Layout", hint: "Section order" },
  { id: "hero", label: "Hero", hint: "Top of page" },
  { id: "grid", label: "Grid intro", hint: "Projects heading" },
  { id: "process", label: "Process", hint: "How it works" },
  { id: "faq", label: "FAQ", hint: "Questions" },
  { id: "inquiry", label: "Inquiry", hint: "Form & WhatsApp" },
  { id: "homepage", label: "Homepage", hint: "Teaser block" },
];

export function SignatureProjectSidebar({
  projects,
  selectedIndex,
  onSelect,
  onAdd,
}: {
  projects: SignatureProject[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="studio-artworks-sidebar">
      <div className="studio-sidebar-top">
        <div>
          <p className="eyebrow studio-sidebar-eyebrow">Your showcase</p>
          <p className="studio-sidebar-count">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      <button type="button" className="btn-secondary studio-sidebar-add" onClick={onAdd}>
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Add new project
      </button>

      <ul className="studio-artwork-list">
        {projects.map((project, index) => {
          const thumbSrc = project.coverImageUrl?.trim() || null;

          return (
            <li key={project.slug || `project-${index}`}>
              <button
                type="button"
                className={`studio-artwork-list-item${index === selectedIndex ? " studio-artwork-list-item--active" : ""}`}
                onClick={() => onSelect(index)}
              >
                <span className="studio-artwork-list-thumb" aria-hidden>
                  {thumbSrc ? (
                    <ArtworkImage
                      key={thumbSrc}
                      src={thumbSrc}
                      alt=""
                      width={56}
                      height={56}
                      className="studio-artwork-list-image"
                    />
                  ) : (
                    <Layers className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </span>

                <span className="studio-artwork-list-copy">
                  <span className="studio-artwork-list-heading">
                    <span className="studio-artwork-list-title">
                      {project.title || "Untitled project"}
                    </span>
                  </span>
                  <span className="studio-artwork-list-meta">
                    {project.slug ? `/${project.slug}` : "Set URL slug"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function SignatureProjectEditorHero({
  project,
  onDelete,
}: {
  project: SignatureProject;
  onDelete: () => void;
}) {
  const coverSrc = project.coverImageUrl?.trim() || null;
  const orientation = resolveSignatureCoverOrientation(project);

  return (
    <div className="studio-editor-hero">
      <div className="studio-editor-hero-main">
        <div className="studio-editor-hero-media">
          {coverSrc ? (
            <ArtworkImage
              key={coverSrc}
              src={coverSrc}
              alt=""
              width={120}
              height={120}
              className="studio-editor-hero-image"
            />
          ) : (
            <div className="studio-editor-hero-placeholder">
              <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="studio-editor-hero-copy">
          <p className="eyebrow studio-sidebar-eyebrow">
            {orientation === "portrait" ? "Vertical cover" : "Horizontal cover"}
          </p>
          <div className="studio-editor-hero-headline">
            <h2 className="studio-editor-title">{project.title || "Untitled project"}</h2>
            <p className="studio-editor-hero-meta">
              {project.designStyles.length} design{" "}
              {project.designStyles.length === 1 ? "style" : "styles"} ·{" "}
              {project.galleryImages.length} gallery{" "}
              {project.galleryImages.length === 1 ? "photo" : "photos"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="studio-icon-btn studio-delete-btn"
        onClick={onDelete}
        aria-label="Delete project"
        title="Delete project"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}

export function SignatureProjectStepNav({
  activeStep,
  onChange,
}: {
  activeStep: SignatureProjectEditorStep;
  onChange: (step: SignatureProjectEditorStep) => void;
}) {
  return (
    <nav className="studio-step-nav" aria-label="Signature project steps">
      {SIGNATURE_PROJECT_STEPS.map((step) => {
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            type="button"
            title={step.hint}
            className={`studio-step-nav-item${activeStep === step.id ? " studio-step-nav-item--active" : ""}`}
            onClick={() => onChange(step.id)}
          >
            <Icon className="studio-step-nav-icon" strokeWidth={1.5} aria-hidden />
            <span className="studio-step-nav-copy">
              <span className="studio-step-nav-label">{step.label}</span>
              <span className="studio-step-nav-hint">{step.hint}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function SignaturePageStepNav({
  activeStep,
  onChange,
}: {
  activeStep: SignaturePageSettingsStep;
  onChange: (step: SignaturePageSettingsStep) => void;
}) {
  return (
    <nav className="studio-step-nav studio-step-nav--compact" aria-label="Page settings steps">
      {SIGNATURE_PAGE_STEPS.map((step) => (
        <button
          key={step.id}
          type="button"
          title={step.hint}
          className={`studio-step-nav-item${activeStep === step.id ? " studio-step-nav-item--active" : ""}`}
          onClick={() => onChange(step.id)}
        >
          <span className="studio-step-nav-copy">
            <span className="studio-step-nav-label">{step.label}</span>
            <span className="studio-step-nav-hint">{step.hint}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

export function SignatureStepPanel({
  step,
  activeStep,
  title,
  lead,
  onPreview,
  children,
}: {
  step: SignatureProjectEditorStep | SignaturePageSettingsStep;
  activeStep: SignatureProjectEditorStep | SignaturePageSettingsStep;
  title: string;
  lead?: string;
  onPreview?: () => void;
  children: ReactNode;
}) {
  if (step !== activeStep) {
    return null;
  }

  return (
    <section className="studio-step-panel">
      <header className="studio-step-panel-header">
        <div className="studio-step-panel-heading">
          <h3 className="studio-step-panel-title">{title}</h3>
          {lead ? <p className="studio-field-hint">{lead}</p> : null}
        </div>
        {onPreview ? (
          <button
            type="button"
            className="btn-secondary studio-section-preview-btn"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Preview
          </button>
        ) : null}
      </header>
      <div className="studio-step-panel-body">
        <div className="studio-step-panel-inner">{children}</div>
      </div>
    </section>
  );
}
