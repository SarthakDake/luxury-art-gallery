import { Reveal } from "@/components/motion/Reveal";
import { RichText } from "@/components/ui/RichText";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import type { SignatureProject, SiteConfig } from "@/types/site-config";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function SignatureProjectView({
  project,
  siteConfig,
}: {
  project: SignatureProject;
  siteConfig: SiteConfig;
}) {
  const inquiry = siteConfig.signatureWallArtPage?.inquiry ??
    DEFAULT_SIGNATURE_WALL_ART_PAGE.inquiry;
  const studio = siteConfig.siteName.split("|")[0]?.trim() || "Colors N Joy";
  const whatsappHref = buildWhatsAppHref(
    siteConfig.whatsappNumber,
    `Hi ${studio}, I'd like to enquire about the Signature Wall Art project "${project.title}".`,
  );
  const formHref =
    inquiry.formHref?.startsWith("#")
      ? `/signature-wall-art${inquiry.formHref}`
      : inquiry.formHref || "/signature-wall-art#inquiry";

  return (
    <div className="site-container page-shell page-section-end">
      <Reveal variant="fade-in" className="signature-project-back">
        <Link href="/signature-wall-art" className="signature-project-back-link">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Back to Signature Wall Art
        </Link>
      </Reveal>

      <Reveal as="header" variant="slide-up" className="signature-project-hero-copy">
        <p className="eyebrow">Signature Project</p>
        <h1 className="page-title">{project.title}</h1>
        {project.summary ? (
          <RichText
            content={project.summary}
            className="body-text signature-project-summary"
          />
        ) : null}
        <div className="signature-project-cta-row">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              className="btn-primary btn-responsive"
              target="_blank"
              rel="noopener noreferrer"
            >
              {inquiry.whatsappLabel}
            </a>
          ) : null}
          <Link href={formHref} className="btn-secondary btn-responsive">
            {inquiry.formCtaLabel}
          </Link>
        </div>
      </Reveal>

      {project.coverImageUrl ? (
        <Reveal variant="fade-in" className="signature-project-cover">
          <SoftImage
            src={getArtworkImageSrc(project.coverImageUrl)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>
      ) : null}

      {project.designStyles.length > 0 ? (
        <section
          className="signature-styles-section"
          aria-labelledby="signature-styles-heading"
        >
          <Reveal variant="slide-up" className="section-header-copy max-w-2xl mb-10">
            <p className="eyebrow">Design Styles</p>
            <h2 id="signature-styles-heading" className="section-title">
              More images and design notes
            </h2>
          </Reveal>

          <div className="signature-styles-list">
            {project.designStyles.map((style, index) => {
              const imageFirst = index % 2 === 0;

              return (
                <Reveal
                  key={`${style.title}-${index}`}
                  variant="slide-up"
                  className={`signature-style-row${imageFirst ? "" : " signature-style-row--flip"}`}
                >
                  <div className="signature-style-media">
                    {style.imageUrl ? (
                      <SoftImage
                        src={getArtworkImageSrc(style.imageUrl)}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="signature-style-placeholder" aria-hidden />
                    )}
                  </div>
                  <div className="signature-style-copy">
                    <h3 className="signature-style-title">{style.title}</h3>
                    {style.description ? (
                      <RichText content={style.description} className="body-text mt-3" />
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      ) : null}

      {project.galleryImages.length > 0 ? (
        <Reveal
          as="section"
          variant="slide-up"
          className="signature-gallery-section"
          aria-label="Project gallery"
        >
          <ul className="signature-gallery-row">
            {project.galleryImages.slice(0, 4).map((imageUrl, index) => (
              <li key={`${imageUrl}-${index}`} className="signature-gallery-item">
                <SoftImage
                  src={getArtworkImageSrc(imageUrl)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      {project.testimonials.length > 0 ? (
        <Reveal
          as="section"
          variant="slide-up"
          className="signature-project-testimonials section-divider-top"
          aria-labelledby="signature-project-testimonials-heading"
        >
          <div className="section-header-copy max-w-2xl mb-8">
            <p className="eyebrow">Client notes</p>
            <h2 id="signature-project-testimonials-heading" className="section-title">
              What they said about this project
            </h2>
          </div>
          <ul className="signature-project-testimonial-grid">
            {project.testimonials.map((item) => (
              <li key={`${item.name}-${item.quote.slice(0, 24)}`} className="signature-project-testimonial">
                <blockquote className="signature-project-quote">
                  <RichText content={item.quote} className="signature-project-rich-quote" />
                </blockquote>
                <p className="signature-project-quote-name">{item.name}</p>
                {item.role ? (
                  <p className="signature-project-quote-role">{item.role}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal variant="fade-in" className="signature-project-footer-cta">
        <div className="signature-project-cta-row">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              className="btn-primary btn-responsive"
              target="_blank"
              rel="noopener noreferrer"
            >
              {inquiry.whatsappLabel}
            </a>
          ) : null}
          <Link href={formHref} className="btn-secondary btn-responsive">
            {inquiry.formCtaLabel}
          </Link>
          <Link href="/signature-wall-art" className="btn-secondary btn-responsive">
            Back to all projects
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
