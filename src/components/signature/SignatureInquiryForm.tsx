"use client";

import type { SignatureWallArtPageConfig } from "@/types/site-config";
import { useState } from "react";

export function SignatureInquiryForm({
  copy,
}: {
  copy: SignatureWallArtPageConfig["inquiry"];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [spaceType, setSpaceType] = useState("");
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: copy.defaultSubject,
          message: [
            spaceType ? `Space / project type: ${spaceType}` : "",
            message,
          ]
            .filter(Boolean)
            .join("\n\n"),
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
      setSpaceType("");
      setMessage("");
    } catch {
      setError("Unable to send your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack signature-inquiry-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="signature-inquiry-name">Name</label>
        <input
          id="signature-inquiry-name"
          className="input-field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signature-inquiry-email">Email</label>
        <input
          id="signature-inquiry-email"
          type="email"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signature-inquiry-space">Space / project type</label>
        <input
          id="signature-inquiry-space"
          className="input-field"
          value={spaceType}
          onChange={(event) => setSpaceType(event.target.value)}
          placeholder="Living room, bedroom, lobby…"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signature-inquiry-message">Message</label>
        <textarea
          id="signature-inquiry-message"
          className="input-field"
          rows={4}
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

      <button type="submit" className="btn-primary btn-responsive" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : copy.submitLabel}
      </button>
    </form>
  );
}
