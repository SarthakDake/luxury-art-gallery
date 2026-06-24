"use client";

import { useSiteConfig } from "@/components/providers/site-config-provider";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactEmailLinks } from "@/components/ui/ContactEmailLinks";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";

const whatsappMessage = "Hello, I am inquiring about your artwork.";

export default function ContactPage() {
  const config = useSiteConfig();
  const whatsappHref = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to send your message. Please try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="contact-intro">
        <p className="eyebrow">Get in Touch</p>
        <h1 className="page-title">Contact</h1>
        <p className="body-text max-w-2xl">
          For acquisitions, commissions, or private viewings, we welcome your
          inquiry. Our studio team responds with care and discretion.
        </p>
      </Reveal>

      <div className="contact-grid">
        <Reveal as="aside" variant="slide-right" className="contact-sidebar">
          <div className="contact-info-card">
            <ul className="contact-info-list">
              <li className="contact-info-item">
                <p className="eyebrow">Studio</p>
                <div className="contact-info-row">
                  <MapPin
                    className="contact-info-icon"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="contact-info-value">{config.studioAddress}</p>
                </div>
              </li>

              <li className="contact-info-item">
                <p className="eyebrow">Email</p>
                <ContactEmailLinks
                  className="contact-info-email-list"
                  linkClassName="contact-info-link contact-info-row"
                  iconClassName="contact-info-icon"
                />
              </li>
            </ul>

            <div className="contact-social-divider">
              <SocialLinks />
            </div>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-block"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Chat on WhatsApp
          </a>
        </Reveal>

        <Reveal
          as="section"
          variant="slide-left"
          aria-labelledby="contact-form-heading"
          className="contact-form-card"
        >
          <h2 id="contact-form-heading" className="eyebrow contact-form-title">
            Send a Message
          </h2>

          {success ? (
            <p className="contact-form-success" role="status">
              Thank you. Your message has been sent and we will get back to you
              soon.
            </p>
          ) : null}

          {error ? (
            <p className="contact-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-field">
              <label htmlFor="name" className="field-label">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-field"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="subject" className="field-label">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="input-field"
                placeholder="Inquiry subject"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="message" className="field-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="input-field input-field--textarea"
                placeholder="Tell us about the work you are interested in..."
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-responsive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
