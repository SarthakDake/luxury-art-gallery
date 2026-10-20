"use client";

import { useSiteConfig } from "@/components/providers/site-config-provider";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactEmailLinks } from "@/components/ui/ContactEmailLinks";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { MapPin, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";

const whatsappMessage = "Hello, I am enquiring about your artwork.";

export function ContactPageContent() {
  const config = useSiteConfig();
  const whatsappHref = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const wallPhotoRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("mobile", mobile);
    formData.set("location", location);
    formData.set("spaceType", spaceType);
    formData.set("message", message);

    const wallPhoto = wallPhotoRef.current?.files?.[0];
    if (wallPhoto && wallPhoto.size > 0) {
      formData.set("wallPhoto", wallPhoto);
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to send your message. Please try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMobile("");
      setLocation("");
      setSpaceType("");
      setMessage("");
      if (wallPhotoRef.current) {
        wallPhotoRef.current.value = "";
      }
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
          { label: "Contact us" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="contact-intro">
        <p className="eyebrow">Get in Touch</p>
        <h1 className="page-title">Contact us</h1>
        <p className="body-text max-w-2xl">
          For acquisitions, commissions, or private viewings, we welcome your
          enquiry. Our studio team responds with care and discretion.
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

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-field">
              <label htmlFor="contact-name" className="field-label">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-field"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-email" className="field-label">
                Email (optional)
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-mobile" className="field-label">
                Mobile number
              </label>
              <input
                id="contact-mobile"
                type="tel"
                name="mobile"
                autoComplete="tel"
                required
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                className="input-field"
                placeholder="+91 …"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-location" className="field-label">
                Location
              </label>
              <input
                id="contact-location"
                type="text"
                name="location"
                autoComplete="off"
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="input-field"
                placeholder="City, area, or project site"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-space" className="field-label">
                Space / project type (optional)
              </label>
              <input
                id="contact-space"
                type="text"
                name="spaceType"
                autoComplete="off"
                value={spaceType}
                onChange={(event) => setSpaceType(event.target.value)}
                className="input-field"
                placeholder="Living room, bedroom, lobby…"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-wall-photo" className="field-label">
                Wall photo (optional)
              </label>
              <input
                ref={wallPhotoRef}
                id="contact-wall-photo"
                type="file"
                name="wallPhoto"
                className="input-field signature-enquiry-file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                disabled={isSubmitting}
              />
              <p className="studio-field-hint">
                Share a phone photo of the wall — JPG, PNG, WebP, or HEIC up to 4 MB.
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="contact-message" className="field-label">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                autoComplete="off"
                required
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="input-field input-field--textarea"
                placeholder="Tell us about the work you are interested in..."
                disabled={isSubmitting}
              />
            </div>

            {error ? (
              <p className="contact-form-error" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="contact-form-success" role="status">
                Thank you. Your message has been sent and we will get back to you
                soon.
              </p>
            ) : null}

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
