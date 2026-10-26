"use client";

import { useState } from "react";

export function PortfolioDownloadForm({
  onUnlocked,
}: {
  onUnlocked: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, location }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to continue. Please try again.");
        return;
      }

      onUnlocked();
    } catch {
      setError("Unable to continue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack trade-portfolio-gate-form" onSubmit={handleSubmit}>
      <p className="body-text trade-portfolio-gate-lead">
        Share your details to view and download the designer portfolio PDF.
      </p>

      <div className="form-field">
        <label htmlFor="portfolio-name">Name or organisation</label>
        <input
          id="portfolio-name"
          className="input-field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="portfolio-email">Email</label>
        <input
          id="portfolio-email"
          type="email"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="portfolio-mobile">Mobile number</label>
        <input
          id="portfolio-mobile"
          type="tel"
          className="input-field"
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          required
          autoComplete="tel"
          placeholder="+91 …"
        />
      </div>

      <div className="form-field">
        <label htmlFor="portfolio-location">Location</label>
        <input
          id="portfolio-location"
          className="input-field"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          required
          autoComplete="address-level2"
          placeholder="City, state, or region"
        />
      </div>

      {error ? (
        <p className="contact-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary btn-responsive" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "View portfolio PDF"}
      </button>
    </form>
  );
}
