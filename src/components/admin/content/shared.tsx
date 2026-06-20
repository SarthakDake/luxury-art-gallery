"use client";

import { ChevronDown, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { getArtworkImageSrc } from "@/lib/artwork-image";

export function StudioTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; description: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="studio-tabs-wrap">
      <div className="studio-tabs" role="tablist" aria-label="Content sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`studio-tab${active === tab.id ? " studio-tab--active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="studio-tab-description">
        {tabs.find((tab) => tab.id === active)?.description}
      </p>
    </div>
  );
}

export function StudioShell({ children }: { children: ReactNode }) {
  return <div className="studio-shell">{children}</div>;
}

export function StudioSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`studio-section${open ? " studio-section--open" : ""}`}>
      <button
        type="button"
        className="studio-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="studio-section-heading">
          {subtitle ? <span className="eyebrow">{subtitle}</span> : null}
          <span className="studio-section-title">{title}</span>
        </span>
        <ChevronDown className="studio-section-icon" strokeWidth={1.5} aria-hidden />
      </button>
      {open ? <div className="studio-section-body">{children}</div> : null}
    </section>
  );
}

export function StudioField({
  label,
  hint,
  children,
  fullWidth = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={`form-field studio-field${fullWidth ? " studio-field--full" : ""}`}>
      <span className="studio-field-label">{label}</span>
      {hint ? <span className="studio-field-hint">{hint}</span> : null}
      {children}
    </label>
  );
}

export function StudioInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`input-field${props.className ? ` ${props.className}` : ""}`}
    />
  );
}

export function StudioTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`input-field input-field--textarea${props.className ? ` ${props.className}` : ""}`}
    />
  );
}

export function StudioSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`input-field${props.className ? ` ${props.className}` : ""}`}
    />
  );
}

export function StudioToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="studio-toggle">
      <span className="studio-toggle-copy">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`studio-toggle-track${checked ? " studio-toggle-track--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="studio-toggle-thumb" />
      </button>
    </label>
  );
}

export function StudioMessage({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={`studio-alert studio-alert--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function StudioGroup({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="studio-group">
      <header className="studio-group-header">
        <p className="eyebrow studio-group-eyebrow">{eyebrow}</p>
        <h4 className="studio-group-title">{title}</h4>
        {description ? <p className="studio-field-hint">{description}</p> : null}
      </header>
      <div className="studio-group-body">{children}</div>
    </section>
  );
}

export function StudioStepFooter({
  back,
  primary,
  secondary,
}: {
  back?: { label: string; onClick: () => void };
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="studio-step-footer">
      <div className="studio-step-footer-side studio-step-footer-side--start">
        {back ? (
          <button type="button" className="btn-secondary studio-step-btn" onClick={back.onClick}>
            {back.label}
          </button>
        ) : null}
      </div>

      <div className="studio-step-footer-side studio-step-footer-side--end">
        {secondary ? (
          <button type="button" className="btn-text studio-step-btn" onClick={secondary.onClick}>
            {secondary.label}
          </button>
        ) : null}
        <button type="button" className="btn-primary studio-step-btn" onClick={primary.onClick}>
          {primary.label}
        </button>
      </div>
    </div>
  );
}

export function StudioRepeaterHeader({
  title,
  onAdd,
  addLabel,
}: {
  title: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="studio-toolbar">
      <h4 className="studio-toolbar-title">{title}</h4>
      <button type="button" className="btn-secondary studio-toolbar-btn" onClick={onAdd}>
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        {addLabel}
      </button>
    </div>
  );
}

export function StudioRepeaterItem({
  index,
  title,
  onRemove,
  removeLabel,
  children,
}: {
  index: number;
  title: string;
  onRemove: () => void;
  removeLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="studio-repeater-item">
      <div className="studio-repeater-item-header">
        <div className="studio-repeater-item-label">
          <span className="studio-repeater-index">{index + 1}</span>
          <span className="studio-repeater-item-title">{title}</span>
        </div>
        <button type="button" className="studio-icon-btn" onClick={onRemove} aria-label={removeLabel}>
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <div className="studio-repeater-item-body">{children}</div>
    </div>
  );
}

export function StudioEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="studio-empty">
      <p className="studio-empty-title">{title}</p>
      <p className="body-text studio-empty-copy">{description}</p>
      <button type="button" className="btn-primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function StudioFormGrid({ children }: { children: ReactNode }) {
  return <div className="studio-form-grid">{children}</div>;
}

export function ImageUploadField({
  label,
  path,
  slug,
  kind,
  galleryIndex,
  onUploaded,
  hint,
  compact = false,
}: {
  label: string;
  path?: string;
  slug: string;
  kind: "cover" | "gallery" | "portrait" | "video-poster";
  galleryIndex?: number;
  onUploaded: (path: string) => void;
  hint?: string;
  compact?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    formData.append("slug", slug);
    if (galleryIndex !== undefined) {
      formData.append("galleryIndex", String(galleryIndex));
    }

    try {
      const response = await fetch("/api/admin/content/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { path?: string; error?: string };

      if (!response.ok || !payload.path) {
        window.alert(payload.error ?? "Upload failed.");
        return;
      }

      onUploaded(payload.path);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const previewSrc = path ? getArtworkImageSrc(path) : null;

  return (
    <StudioField label={label} hint={hint} fullWidth>
      <label className={`studio-dropzone${compact ? " studio-dropzone--compact" : ""}`}>
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt=""
            width={compact ? 88 : 120}
            height={compact ? 88 : 120}
            className="studio-dropzone-image"
            unoptimized
          />
        ) : (
          <span className="studio-dropzone-placeholder" aria-hidden>
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          </span>
        )}

        <span className="studio-dropzone-copy">
          <span className="studio-dropzone-title">
            {uploading ? "Uploading…" : previewSrc ? "Replace image" : "Upload image"}
          </span>
          <span className="studio-field-hint">
            JPG, PNG, WebP, or HEIC · saved automatically
          </span>
          {path ? <span className="studio-upload-path">{path}</span> : null}
        </span>

        <span className="btn-secondary studio-dropzone-action">
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          Choose file
        </span>

        <input type="file" accept="image/*,.heic,.heif" hidden onChange={handleChange} />
      </label>
    </StudioField>
  );
}
