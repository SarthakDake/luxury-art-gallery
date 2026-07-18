import { Reveal } from "@/components/motion/Reveal";
import { SignatureFaq } from "@/components/signature/SignatureFaq";
import { SignatureHashScroll } from "@/components/signature/SignatureHashScroll";
import { SignatureInquiryForm } from "@/components/signature/SignatureInquiryForm";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import {
  DEFAULT_SIGNATURE_PAGE_SECTION_ORDER,
  DEFAULT_SIGNATURE_WALL_ART_PAGE,
} from "@/lib/site-config/defaults";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import type {
  SignaturePageSectionId,
  SignatureWallArtPageConfig,
  SiteConfig,
} from "@/types/site-config";
import Link from "next/link";

function ProjectsSection({
  resolved,
}: {
  resolved: SignatureWallArtPageConfig;
}) {
  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="signature-projects-section"
      aria-labelledby="signature-projects-heading"
    >
      <div className="section-header-copy max-w-2xl">
        <p className="eyebrow">{resolved.projects.eyebrow}</p>
        <h2 id="signature-projects-heading" className="section-title">
          {resolved.projects.title}
        </h2>
        {resolved.projects.subtitle ? (
          <p className="body-text mt-3">{resolved.projects.subtitle}</p>
        ) : null}
      </div>

      <ul className="signature-project-grid" data-reveal-stagger>
        {resolved.projects.items.map((project) => (
          <li key={project.slug} className="signature-project-card">
            <Link
              href={`/signature-wall-art/${project.slug}`}
              className="signature-project-card-link"
            >
              <div className="signature-project-card-media">
                {project.coverImageUrl ? (
                  <SoftImage
                    src={getArtworkImageSrc(project.coverImageUrl)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="signature-project-card-placeholder" aria-hidden />
                )}
              </div>
              <div className="signature-project-card-copy">
                <h3 className="signature-project-card-title">{project.title}</h3>
                {project.summary ? (
                  <p className="body-text signature-project-card-summary">
                    {project.summary}
                  </p>
                ) : null}
                <span className="signature-project-card-action">View project</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function ProcessSection({
  resolved,
}: {
  resolved: SignatureWallArtPageConfig;
}) {
  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="signature-process-section section-divider-top"
      aria-labelledby="signature-process-heading"
    >
      <div className="section-header-copy max-w-2xl">
        <p className="eyebrow">{resolved.process.eyebrow}</p>
        <h2 id="signature-process-heading" className="section-title">
          {resolved.process.title}
        </h2>
        {resolved.process.subtitle ? (
          <p className="body-text mt-3">{resolved.process.subtitle}</p>
        ) : null}
      </div>
      <ol className="signature-process-list" data-reveal-stagger>
        {resolved.process.steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="signature-process-item">
            <span className="signature-process-index" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="signature-process-title">{step.title}</h3>
              <p className="body-text mt-2">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

function FaqSection({ resolved }: { resolved: SignatureWallArtPageConfig }) {
  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="signature-faq-section section-divider-top"
      aria-labelledby="signature-faq-heading"
    >
      <div className="section-header-copy max-w-2xl mb-8">
        <p className="eyebrow">{resolved.faq.eyebrow}</p>
        <h2 id="signature-faq-heading" className="section-title">
          {resolved.faq.title}
        </h2>
        {resolved.faq.subtitle ? (
          <p className="body-text mt-3">{resolved.faq.subtitle}</p>
        ) : null}
      </div>
      <SignatureFaq items={resolved.faq.items} />
    </Reveal>
  );
}

function InquirySection({
  resolved,
  whatsappHref,
}: {
  resolved: SignatureWallArtPageConfig;
  whatsappHref: string;
}) {
  return (
    <Reveal
      as="section"
      id="inquiry"
      variant="slide-up"
      className="signature-inquiry-section section-divider-top"
      aria-labelledby="signature-inquiry-heading"
    >
      <div className="signature-inquiry-layout">
        <div className="section-header-copy">
          <p className="eyebrow">{resolved.inquiry.eyebrow}</p>
          <h2 id="signature-inquiry-heading" className="section-title">
            {resolved.inquiry.title}
          </h2>
          {resolved.inquiry.subtitle ? (
            <p className="body-text mt-3">{resolved.inquiry.subtitle}</p>
          ) : null}
          <div className="signature-inquiry-actions">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className="btn-secondary btn-responsive"
                target="_blank"
                rel="noopener noreferrer"
              >
                {resolved.inquiry.whatsappLabel}
              </a>
            ) : null}
            <a
              href={resolved.inquiry.formHref || "#inquiry"}
              className="btn-primary btn-responsive"
            >
              {resolved.inquiry.formCtaLabel}
            </a>
          </div>
        </div>
        <SignatureInquiryForm copy={resolved.inquiry} />
      </div>
    </Reveal>
  );
}

export function SignatureWallArtView({
  page,
  siteConfig,
}: {
  page: SignatureWallArtPageConfig | undefined;
  siteConfig: SiteConfig;
}) {
  const resolved = page ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;
  const heroImage =
    resolved.hero.imageUrl.trim() || DEFAULT_SIGNATURE_WALL_ART_PAGE.hero.imageUrl;
  const whatsappHref = buildWhatsAppHref(
    siteConfig.whatsappNumber,
    `Hi ${siteConfig.siteName.split("|")[0]?.trim() || "Colors N Joy"}, I'd like to enquire about Signature Wall Art.`,
  );
  const sectionOrder =
    resolved.sectionOrder?.length > 0
      ? resolved.sectionOrder
      : DEFAULT_SIGNATURE_PAGE_SECTION_ORDER;

  function renderSection(id: SignaturePageSectionId) {
    switch (id) {
      case "projects":
        return <ProjectsSection key={id} resolved={resolved} />;
      case "process":
        return <ProcessSection key={id} resolved={resolved} />;
      case "faq":
        return <FaqSection key={id} resolved={resolved} />;
      case "inquiry":
        return (
          <InquirySection key={id} resolved={resolved} whatsappHref={whatsappHref} />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <SignatureHashScroll />
      <section
        className={`signature-page-hero ${heroImage ? "signature-page-hero--image" : ""}`}
        aria-label={resolved.intro.title}
      >
        {heroImage ? (
          <SoftImage
            src={getArtworkImageSrc(heroImage)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="signature-page-hero-media object-cover"
          />
        ) : (
          <div className="signature-page-hero-fallback" aria-hidden />
        )}
      </section>

      <div className="site-container page-shell page-section-end">
        <Reveal as="header" variant="slide-up" className="signature-page-intro">
          <p className="eyebrow">{resolved.intro.eyebrow}</p>
          <h1 className="page-title">{resolved.intro.title}</h1>
          {resolved.intro.subtitle ? (
            <p className="body-text signature-page-intro-copy">{resolved.intro.subtitle}</p>
          ) : null}
        </Reveal>

        {sectionOrder.map((id) => renderSection(id))}
      </div>
    </>
  );
}
