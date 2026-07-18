"use client";

import type { ForInteriorDesignersConfig } from "@/types/site-config";
import { useState } from "react";

export function TradeInquiryForm({
  copy,
}: {
  copy: ForInteriorDesignersConfig["inquiryForm"];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/trade-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          projectType,
          subject: copy.defaultSubject,
          message,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to send your inquiry. Please try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setCompany("");
      setProjectType("");
      setMessage("");
    } catch {
      setError("Unable to send your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack trade-inquiry-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="trade-name">Name</label>
        <input
          id="trade-name"
          className="input-field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="form-field">
        <label htmlFor="trade-email">Email</label>
        <input
          id="trade-email"
          type="email"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor="trade-company">Company / Studio</label>
        <input
          id="trade-company"
          className="input-field"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          autoComplete="organization"
        />
      </div>
      <div className="form-field">
        <label htmlFor="trade-project-type">Project type</label>
        <input
          id="trade-project-type"
          className="input-field"
          value={projectType}
          onChange={(event) => setProjectType(event.target.value)}
          placeholder="Residence, hospitality, lobby…"
        />
      </div>
      <div className="form-field">
        <label htmlFor="trade-message">Project notes</label>
        <textarea
          id="trade-message"
          className="input-field"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </div>

      {error ? (
        <p className="contact-form-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="contact-form-success" role="status">
          {copy.successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-primary btn-responsive"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : copy.submitLabel}
      </button>
    </form>
  );
}
