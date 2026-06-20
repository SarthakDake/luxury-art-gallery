"use client";

import config from "@/data/config.json";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";

const whatsappMessage = "Hello, I am inquiring about your artwork.";
const whatsappHref = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoLink = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink, "_self");
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
                <div className="contact-info-row">
                  <Mail
                    className="contact-info-icon"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="contact-info-link"
                  >
                    {config.contactEmail}
                  </a>
                </div>
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
              />
            </div>

            <button type="submit" className="btn-primary btn-responsive">
              Send Message
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
