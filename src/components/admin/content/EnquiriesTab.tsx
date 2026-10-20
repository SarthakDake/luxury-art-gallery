"use client";

import {
  StudioGroup,
  StudioMessage,
  StudioSection,
  StudioShell,
} from "./shared";
import type { FormEnquiryKind } from "@/lib/form-enquiry-store";
import {
  FORM_ENQUIRY_KIND_LABELS,
  formatFormEnquiryWhen,
  enquirySummaryLine,
  listFormEnquiryFields,
  type AdminFormEnquiry,
  type FormEnquiryFilter,
} from "@/lib/form-enquiry-display";
import { useCallback, useEffect, useMemo, useState } from "react";

const FILTER_OPTIONS: Array<{ id: FormEnquiryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "contact", label: FORM_ENQUIRY_KIND_LABELS.contact },
  { id: "signature-enquiry", label: FORM_ENQUIRY_KIND_LABELS["signature-enquiry"] },
  { id: "trade-enquiry", label: FORM_ENQUIRY_KIND_LABELS["trade-enquiry"] },
];

function resolveWallPhotoHref(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

export function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<AdminFormEnquiry[]>([]);
  const [filter, setFilter] = useState<FormEnquiryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMigrationRequired(false);

    try {
      const response = await fetch("/api/admin/content/enquiries");
      const payload = (await response.json()) as {
        enquiries?: AdminFormEnquiry[];
        migrationRequired?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load enquiries.");
      }

      setEnquiries(payload.enquiries ?? []);
      setMigrationRequired(Boolean(payload.migrationRequired));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load enquiries.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  const filtered = useMemo(() => {
    if (filter === "all") {
      return enquiries;
    }

    return enquiries.filter((entry) => entry.kind === filter);
  }, [enquiries, filter]);

  return (
    <StudioShell>
      <StudioSection
        title="Visitor enquiries"
        subtitle="Inbox"
        defaultOpen
      >
        <StudioGroup
          eyebrow="Submissions"
          title="Contact, signature & trade forms"
          description="Every form submission is saved here. Email status shows whether SMTP delivery succeeded when the visitor sent the form."
        >
          <div className="studio-enquiries-toolbar">
            <div className="studio-enquiries-filters" role="group" aria-label="Filter enquiries">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`studio-enquiries-filter${
                    filter === option.id ? " studio-enquiries-filter--active" : ""
                  }`}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary studio-toolbar-btn"
              disabled={loading}
              onClick={() => void loadEnquiries()}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {migrationRequired ? (
            <StudioMessage tone="error">
              The enquiries database table is not available yet. Run{" "}
              <code className="text-sm">npm run db:deploy</code> on production (or wait for
              the next deploy) so saved form submissions can appear here.
            </StudioMessage>
          ) : null}

          {error ? <StudioMessage tone="error">{error}</StudioMessage> : null}

          {!loading && !error && filtered.length === 0 ? (
            <p className="body-text studio-enquiries-empty">
              {enquiries.length === 0
                ? "No enquiries yet. Submissions from Contact, Signature Wall Art, and For Interior Designers will appear here."
                : "No enquiries match this filter."}
            </p>
          ) : null}

          <div className="studio-repeater-list">
            {filtered.map((entry, index) => {
              const fields = listFormEnquiryFields(entry.payload);
              const summary = enquirySummaryLine(entry.payload);

              return (
                <article key={entry.id} className="studio-repeater-item studio-enquiry-item">
                  <div className="studio-repeater-item-header">
                    <div className="studio-repeater-item-label">
                      <span className="studio-repeater-index">{index + 1}</span>
                      <div className="studio-enquiry-heading">
                        <span className="studio-repeater-item-title">
                          {FORM_ENQUIRY_KIND_LABELS[entry.kind as FormEnquiryKind]}
                        </span>
                        <span className="studio-enquiry-summary">{summary}</span>
                      </div>
                    </div>
                    <div className="studio-repeater-item-actions">
                      <span
                        className={`studio-enquiry-badge${
                          entry.emailSent
                            ? " studio-enquiry-badge--sent"
                            : " studio-enquiry-badge--saved"
                        }`}
                      >
                        {entry.emailSent ? "Email sent" : "Saved only"}
                      </span>
                      <time
                        className="studio-enquiry-time"
                        dateTime={entry.createdAt}
                      >
                        {formatFormEnquiryWhen(entry.createdAt)}
                      </time>
                    </div>
                  </div>

                  <div className="studio-repeater-item-body">
                    <dl className="studio-enquiry-details">
                      {fields.map((field) => (
                        <div key={`${entry.id}-${field.key}`} className="studio-enquiry-detail">
                          <dt>{field.label}</dt>
                          <dd>
                            {field.isUrl ? (
                              <a
                                href={resolveWallPhotoHref(field.value)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-link"
                              >
                                View wall photo
                              </a>
                            ) : field.key === "message" ? (
                              <span className="studio-enquiry-message">{field.value}</span>
                            ) : (
                              field.value
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
