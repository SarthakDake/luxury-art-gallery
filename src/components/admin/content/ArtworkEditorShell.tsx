"use client";

import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { formatPriceFrom, isShowcaseOnly, type Artwork } from "@/types/artwork";
import {
  ImageIcon,
  Layers,
  MoreHorizontal,
  Plus,
  Sparkles,
  Tag,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";

export type ArtworkEditorStep = "details" | "photos" | "pricing" | "videos" | "more";

export const ARTWORK_EDITOR_STEPS: {
  id: ArtworkEditorStep;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}[] = [
  { id: "details", label: "Details", hint: "Name & description", icon: Sparkles },
  { id: "photos", label: "Photos", hint: "Cover & gallery", icon: ImageIcon },
  { id: "pricing", label: "Pricing", hint: "Sizes & prices", icon: Tag },
  { id: "videos", label: "Videos", hint: "YouTube & more", icon: Video },
  { id: "more", label: "More", hint: "Extra options", icon: MoreHorizontal },
];

export function ArtworkSidebar({
  artworks,
  selectedIndex,
  onSelect,
  onAdd,
}: {
  artworks: Artwork[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="studio-artworks-sidebar">
      <div className="studio-sidebar-top">
        <div>
          <p className="eyebrow studio-sidebar-eyebrow">Your collection</p>
          <p className="studio-sidebar-count">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </div>

      <button type="button" className="btn-secondary studio-sidebar-add" onClick={onAdd}>
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Add new piece
      </button>

      <ul className="studio-artwork-list">
        {artworks.map((item, index) => {
          const thumbSrc = item.imageUrl ?? null;

          return (
            <li key={item.id || index}>
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
                      {item.title || "Untitled piece"}
                    </span>
                    {item.category ? (
                      <>
                        <span className="studio-artwork-list-sep" aria-hidden>
                          ·
                        </span>
                        <span className="studio-artwork-list-meta">{item.category}</span>
                      </>
                    ) : (
                      <span className="studio-artwork-list-meta">No category yet</span>
                    )}
                  </span>
                  <span
                    className={`studio-stock-pill${item.inStock ? " studio-stock-pill--in" : " studio-stock-pill--out"}`}
                  >
                    {item.inStock ? "In stock" : "Sold out"}
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

export function ArtworkEditorHero({
  artwork,
  onDelete,
}: {
  artwork: Artwork;
  onDelete: () => void;
}) {
  const coverSrc = artwork.imageUrl ?? null;

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
          <p className="eyebrow studio-sidebar-eyebrow">{artwork.id}</p>
          <div className="studio-editor-hero-headline">
            <h2 className="studio-editor-title">{artwork.title || "Untitled piece"}</h2>
            <p className="studio-editor-hero-meta">
              {artwork.category || "No category"}
              {artwork.subcategory ? ` · ${artwork.subcategory}` : ""}
              {artwork.material ? ` · ${artwork.material}` : ""}
            </p>
          </div>
          {artwork.sizes.length > 0 && !isShowcaseOnly(artwork) ? (
            <p className="studio-editor-hero-price">{formatPriceFrom(artwork)}</p>
          ) : null}
        </div>
      </div>

      <button type="button" className="btn-secondary studio-delete-btn" onClick={onDelete}>
        Delete piece
      </button>
    </div>
  );
}

export function ArtworkStepNav({
  activeStep,
  onChange,
}: {
  activeStep: ArtworkEditorStep;
  onChange: (step: ArtworkEditorStep) => void;
}) {
  return (
    <nav className="studio-step-nav" aria-label="Artwork editor steps">
      {ARTWORK_EDITOR_STEPS.map((step) => {
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

export function ArtworkStepPanel({
  step,
  activeStep,
  title,
  lead,
  children,
}: {
  step: ArtworkEditorStep;
  activeStep: ArtworkEditorStep;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  if (step !== activeStep) {
    return null;
  }

  return (
    <section className="studio-step-panel">
      <header className="studio-step-panel-header">
        <h3 className="studio-step-panel-title">{title}</h3>
        {lead ? <p className="studio-field-hint">{lead}</p> : null}
      </header>
      <div className="studio-step-panel-body">
        <div className="studio-step-panel-inner">{children}</div>
      </div>
    </section>
  );
}
