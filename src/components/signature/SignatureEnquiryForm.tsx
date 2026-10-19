"use client";

import { RichText } from "@/components/ui/RichText";
import type { SignatureWallArtPageConfig } from "@/types/site-config";
import { useRef, useState } from "react";

export function SignatureEnquiryForm({
  copy,
  projectTitle,
  idPrefix = "signature-enquiry",
}: {
  copy: SignatureWallArtPageConfig["enquiry"];
  projectTitle?: string;
  idPrefix?: string;
}) {
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

    const subject = projectTitle
      ? `${copy.defaultSubject}: ${projectTitle}`
      : copy.defaultSubject;

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("mobile", mobile);
    formData.set("location", location);
    formData.set("spaceType", spaceType);
    formData.set("subject", subject);
    formData.set("message", message);
    if (projectTitle) {
      formData.set("projectTitle", projectTitle);
    }

    const wallPhoto = wallPhotoRef.current?.files?.[0];
    if (!wallPhoto || wallPhoto.size <= 0) {
      setError("Please upload a wall photo.");
      setIsSubmitting(false);
      return;
    }
    formData.set("wallPhoto", wallPhoto);

    try {
      const response = await fetch("/api/signature-enquiry", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to send your enquiry. Please try again.");
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
      setError("Unable to send your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack signature-enquiry-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-name`}>Name</label>
        <input
          id={`${idPrefix}-name`}
          className="input-field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-email`}>Email (optional)</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-mobile`}>Mobile number</label>
        <input
          id={`${idPrefix}-mobile`}
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
        <label htmlFor={`${idPrefix}-location`}>Location</label>
        <input
          id={`${idPrefix}-location`}
          className="input-field"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          required
          placeholder="City, area, or project site"
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-space`}>Space / project type</label>
        <input
          id={`${idPrefix}-space`}
          className="input-field"
          value={spaceType}
          onChange={(event) => setSpaceType(event.target.value)}
          required
          placeholder="Living room, bedroom, lobby…"
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-wall-photo`}>Wall photo</label>
        <input
          ref={wallPhotoRef}
          id={`${idPrefix}-wall-photo`}
          type="file"
          className="input-field signature-enquiry-file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          required
        />
        <p className="studio-field-hint">Share a phone photo of the wall — JPG, PNG, WebP, or HEIC up to 4 MB.</p>
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-message`}>Message</label>
        <textarea
          id={`${idPrefix}-message`}
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
        <div role="status">
          <RichText content={copy.successMessage} className="contact-form-success" />
        </div>
      ) : null}

      <button type="submit" className="btn-primary btn-responsive" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : copy.submitLabel}
      </button>
    </form>
  );
}
