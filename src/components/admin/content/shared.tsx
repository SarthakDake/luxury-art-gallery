"use client";

import { upload } from "@vercel/blob/client";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { toColorInputValue } from "@/lib/color-input";
import {
  buildUploadPathname,
  isPdfUpload,
  resolveClientImageExtension,
  resolveUploadContentType,
  SERVER_UPLOAD_PREFERRED_MAX_BYTES,
} from "@/lib/upload-path";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out.`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

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
  onPreview,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  /** Opens a focused live preview for this section’s place on the site. */
  onPreview?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`studio-section${open ? " studio-section--open" : ""}`}>
      <div className="studio-section-bar">
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
      </div>
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

export function StudioColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const pickerValue = toColorInputValue(value);

  return (
    <StudioField label={label} hint={hint}>
      <div className="studio-color-field">
        <input
          type="color"
          className="studio-color-picker"
          value={pickerValue}
          title={value}
          aria-label={`${label} color picker`}
          onChange={(event) => onChange(event.target.value)}
        />
        <StudioInput
          value={value}
          spellCheck={false}
          aria-label={`${label} color code`}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </StudioField>
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
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`studio-toggle${disabled ? " studio-toggle--disabled" : ""}`}>
      <span className="studio-toggle-copy">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
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
  onMoveUp,
  onMoveDown,
  showRemove = true,
  children,
}: {
  index: number;
  title: string;
  onRemove?: () => void;
  removeLabel?: string;
  /** Move this item one slot up in the list (omit or leave undefined when disabled). */
  onMoveUp?: () => void;
  /** Move this item one slot down in the list (omit or leave undefined when disabled). */
  onMoveDown?: () => void;
  showRemove?: boolean;
  children: ReactNode;
}) {
  const canReorder = Boolean(onMoveUp || onMoveDown);

  return (
    <div className="studio-repeater-item">
      <div className="studio-repeater-item-header">
        <div className="studio-repeater-item-label">
          <span className="studio-repeater-index">{index + 1}</span>
          <span className="studio-repeater-item-title">{title}</span>
        </div>
        <div className="studio-repeater-item-actions">
          {canReorder ? (
            <>
              <button
                type="button"
                className="studio-icon-btn"
                onClick={onMoveUp}
                disabled={!onMoveUp}
                aria-label="Move up"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                className="studio-icon-btn"
                onClick={onMoveDown}
                disabled={!onMoveDown}
                aria-label="Move down"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </>
          ) : null}
          {showRemove && onRemove ? (
            <button
              type="button"
              className="studio-icon-btn"
              onClick={onRemove}
              aria-label={removeLabel ?? "Remove"}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
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
  videoIndex,
  onUploaded,
  hint,
  compact = false,
}: {
  label: string;
  path?: string;
  slug: string;
  kind: "cover" | "gallery" | "portrait" | "hero" | "page" | "video-poster";
  galleryIndex?: number;
  videoIndex?: number;
  onUploaded: (path: string) => void;
  hint?: string;
  compact?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadViaServer(file: File): Promise<string> {
    const contentType = resolveUploadContentType(file.name, file.type);
    const typedFile =
      file.type && file.type === contentType
        ? file
        : new File([file], file.name, {
            type: contentType,
            lastModified: file.lastModified,
          });

    const formData = new FormData();
    formData.append("file", typedFile);
    formData.append("mimeType", contentType);
    formData.append("kind", kind);
    formData.append("slug", slug);
    if (galleryIndex !== undefined) {
      formData.append("galleryIndex", String(galleryIndex));
    }
    if (videoIndex !== undefined) {
      formData.append("videoIndex", String(videoIndex));
    }

    const response = await fetch("/api/admin/content/upload", {
      method: "POST",
      credentials: "same-origin",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as {
      path?: string;
      error?: string;
    } | null;

    if (!response.ok || !payload?.path) {
      throw new Error(payload?.error ?? "Upload failed.");
    }

    return payload.path;
  }

  async function uploadViaDirectBlob(file: File): Promise<string> {
    const capabilitiesResponse = await fetch("/api/admin/content/upload/capabilities", {
      credentials: "same-origin",
    });

    if (!capabilitiesResponse.ok) {
      throw new Error("Direct upload is unavailable.");
    }

    const capabilities = (await capabilitiesResponse.json()) as {
      directBlob?: boolean;
      access?: "public" | "private";
    };

    if (!capabilities.directBlob) {
      throw new Error("Direct upload is unavailable.");
    }

    const contentType = resolveUploadContentType(file.name, file.type);
    const extension = resolveClientImageExtension(file.name, contentType);
    if (!extension) {
      throw new Error(
        "Unsupported image type. Use JPG, PNG, WebP, AVIF, GIF, HEIC/HEIF, TIFF, or BMP.",
      );
    }

    const { pathname } = buildUploadPathname({
      kind,
      slug,
      extension,
      galleryIndex,
      videoIndex,
    });

    // Multipart is only needed for large files; for ~2MB HEIC it is slower and
    // more fragile when the browser reports an empty MIME type.
    const useMultipart = file.size > SERVER_UPLOAD_PREFERRED_MAX_BYTES;

    await upload(pathname, file, {
      access: capabilities.access ?? "private",
      handleUploadUrl: "/api/admin/content/upload/blob",
      multipart: useMultipart,
      contentType,
    });

    // Store virtual path (not the signed blob URL) so the site proxy can serve it.
    return `/${pathname}?v=${Date.now()}`;
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Prefer server FormData for typical CMS images (incl. ~2MB iPhone HEIC).
      // Direct Blob multipart often hangs when File.type is empty.
      const preferServer = file.size <= SERVER_UPLOAD_PREFERRED_MAX_BYTES;
      let uploadedPath = "";

      if (preferServer) {
        try {
          uploadedPath = await withTimeout(uploadViaServer(file), 90_000, "Server upload");
        } catch (serverError) {
          console.warn("[ImageUploadField] server upload failed, trying direct:", serverError);
          uploadedPath = await withTimeout(
            uploadViaDirectBlob(file),
            120_000,
            "Direct upload",
          );
        }
      } else {
        try {
          uploadedPath = await withTimeout(
            uploadViaDirectBlob(file),
            180_000,
            "Direct upload",
          );
        } catch (directError) {
          console.warn("[ImageUploadField] direct upload failed, trying server:", directError);
          uploadedPath = await withTimeout(uploadViaServer(file), 180_000, "Server upload");
        }
      }

      onUploaded(uploadedPath);
      setSuccess(`Successfully uploaded ${file.name}`);
    } catch (uploadError) {
      console.error("[ImageUploadField] upload failed:", uploadError);
      setSuccess("");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Check your connection and try again.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const previewSrc = path ?? null;
  const dropzoneClassName = [
    "studio-dropzone",
    compact ? "studio-dropzone--compact" : "",
    uploading ? "is-uploading" : "",
    success ? "is-success" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <StudioField label={label} hint={hint} fullWidth>
      <label className={dropzoneClassName}>
        {previewSrc ? (
          <ArtworkImage
            key={previewSrc}
            src={previewSrc}
            alt=""
            width={compact ? 88 : 120}
            height={compact ? 88 : 120}
            className="studio-dropzone-image"
          />
        ) : (
          <span className="studio-dropzone-placeholder" aria-hidden>
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          </span>
        )}

        <span className="studio-dropzone-copy">
          <span className="studio-dropzone-title">
            {uploading
              ? "Uploading…"
              : success
                ? "Upload complete"
                : previewSrc
                  ? "Replace image"
                  : "Upload image"}
          </span>
          <span className="studio-field-hint">
            Any image format (incl. iPhone HEIC/HEIF) · stored as-is, no size limit ·
            click Save to publish
          </span>
        </span>

        <span className="btn-secondary studio-dropzone-action">
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          Choose file
        </span>

        <input
          type="file"
          accept="image/*,.heic,.heif,.tif,.tiff,.avif,.bmp"
          hidden
          disabled={uploading}
          onChange={handleChange}
        />
      </label>
      {success ? (
        <p className="studio-upload-feedback studio-upload-feedback--success" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="studio-upload-feedback studio-upload-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
    </StudioField>
  );
}

export function DocumentUploadField({
  label,
  path,
  filename,
  slug = "designer-portfolio",
  onUploaded,
  hint,
}: {
  label: string;
  path?: string;
  filename?: string;
  slug?: string;
  onUploaded: (path: string, filename: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!isPdfUpload(file.name, file.type)) {
      setError("Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mimeType", file.type || "application/pdf");
      formData.append("kind", "document");
      formData.append("slug", slug);

      const response = await withTimeout(
        fetch("/api/admin/content/upload", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        }),
        120_000,
        "PDF upload",
      );

      const payload = (await response.json().catch(() => null)) as {
        path?: string;
        filename?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.path) {
        throw new Error(payload?.error ?? "Upload failed.");
      }

      onUploaded(payload.path, payload.filename || file.name);
      setSuccess(`Successfully uploaded ${file.name}`);
    } catch (uploadError) {
      setSuccess("");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Check your connection and try again.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <StudioField label={label} hint={hint} fullWidth>
      <label
        className={`studio-dropzone${uploading ? " is-uploading" : ""}${
          success ? " is-success" : ""
        }`}
      >
        <span className="studio-dropzone-placeholder" aria-hidden>
          <FileText className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="studio-dropzone-copy">
          <span className="studio-dropzone-title">
            {uploading
              ? "Uploading…"
              : success
                ? "Upload complete"
                : path
                  ? "Replace PDF"
                  : "Upload PDF"}
          </span>
          <span className="studio-field-hint">
            {path
              ? filename || path.split("/").pop()?.split("?")[0] || "PDF uploaded"
              : "PDF only · click Save to publish on the trade page"}
          </span>
        </span>
        <span className="btn-secondary studio-dropzone-action">
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          Choose PDF
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          hidden
          disabled={uploading}
          onChange={handleChange}
        />
      </label>
      {success ? (
        <p className="studio-upload-feedback studio-upload-feedback--success" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="studio-upload-feedback studio-upload-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
    </StudioField>
  );
}
