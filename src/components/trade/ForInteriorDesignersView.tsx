import { CollectionsSection } from "@/components/home/CollectionsSection";
import { CuratedWorksSection } from "@/components/home/CuratedWorksSection";
import { Reveal } from "@/components/motion/Reveal";
import { TradeInquiryForm } from "@/components/trade/TradeInquiryForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { DEFAULT_FOR_INTERIOR_DESIGNERS } from "@/lib/site-config/defaults";
import { getSiteDocumentSrc } from "@/lib/site-document";
import type { Artwork } from "@/types/artwork";
import type { SiteConfig } from "@/types/site-config";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

export function ForInteriorDesignersView({
  config,
  artworks,
}: {
  config: SiteConfig;
  artworks: Artwork[];
}) {
  const page = config.forInteriorDesigners ?? DEFAULT_FOR_INTERIOR_DESIGNERS;
  const heroImage = page.hero.imageUrl.trim();
  const pdfUrl = page.portfolioPdf.url.trim();
  const pdfViewSrc = pdfUrl
    ? getSiteDocumentSrc(pdfUrl, { filename: page.portfolioPdf.filename })
    : "";
  const pdfDownloadSrc = pdfUrl
    ? getSiteDocumentSrc(pdfUrl, {
        download: true,
        filename: page.portfolioPdf.filename || "designer-portfolio.pdf",
      })
    : "";

  return (
    <>
      <section
        className={`hero-block ${heroImage ? "hero-block--image" : ""} trade-hero`}
      >
        {heroImage ? (
          <>
            <SoftImage
              src={getArtworkImageSrc(heroImage)}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-media object-cover"
            />
            <div className="hero-overlay" aria-hidden />
          </>
        ) : null}

        <div className="site-container hero-inner">
          <div className="hero-content">
            <Reveal as="p" variant="fade-in" immediate className="hero-eyebrow">
              {page.hero.eyebrow}
            </Reveal>
            <Reveal as="h1" variant="slide-up" immediate delay={80} className="hero-title">
              {page.hero.title}
            </Reveal>
            <Reveal
              as="p"
              variant="slide-up"
              immediate
              delay={140}
              className="hero-subtitle"
            >
              {page.hero.subtitle}
            </Reveal>
            <Reveal
              variant="slide-up"
              immediate
              delay={220}
              className={`hero-actions ${heroImage ? "hero-actions--on-dark" : ""}`}
            >
              <Link href={page.hero.primaryCtaHref} className="btn-primary btn-responsive">
                {page.hero.primaryCtaLabel}
              </Link>
              {page.hero.secondaryCtaLabel ? (
                <Link
                  href={page.hero.secondaryCtaHref || "#portfolio-pdf"}
                  className="btn-secondary btn-responsive"
                >
                  {page.hero.secondaryCtaLabel}
                </Link>
              ) : null}
            </Reveal>
          </div>
        </div>
      </section>

      <div className="site-container page-shell page-section-end">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "For Interior Designers" },
          ]}
        />

        <Reveal
          as="section"
          variant="slide-up"
          className="trade-section"
          aria-labelledby="why-partner-heading"
        >
          <div className="section-header-copy max-w-2xl">
            <p className="eyebrow">{page.whyPartner.eyebrow}</p>
            <h2 id="why-partner-heading" className="section-title">
              {page.whyPartner.title}
            </h2>
            <p className="body-text mt-3">{page.whyPartner.subtitle}</p>
          </div>
          <ul className="trade-point-grid" data-reveal-stagger>
            {page.whyPartner.points.map((point) => (
              <li key={point.title} className="trade-point-item">
                <h3 className="trade-point-title">{point.title}</h3>
                <p className="body-text">{point.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          as="section"
          variant="slide-up"
          className="trade-section section-divider-top"
          aria-labelledby="benefits-heading"
        >
          <div className="section-header-copy max-w-2xl">
            <p className="eyebrow">{page.benefits.eyebrow}</p>
            <h2 id="benefits-heading" className="section-title">
              {page.benefits.title}
            </h2>
            <p className="body-text mt-3">{page.benefits.subtitle}</p>
          </div>
          <ul className="trade-point-grid" data-reveal-stagger>
            {page.benefits.items.map((item) => (
              <li key={item.title} className="trade-point-item">
                <h3 className="trade-point-title">{item.title}</h3>
                <p className="body-text">{item.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          as="section"
          id="portfolio-pdf"
          variant="slide-up"
          className="trade-section section-divider-top"
          aria-labelledby="portfolio-pdf-heading"
        >
          <div className="section-header mb-8">
            <div className="section-header-copy max-w-2xl">
              <p className="eyebrow">{page.portfolioPdf.eyebrow}</p>
              <h2 id="portfolio-pdf-heading" className="section-title">
                {page.portfolioPdf.title}
              </h2>
              <p className="body-text mt-3">{page.portfolioPdf.subtitle}</p>
            </div>
            {pdfDownloadSrc ? (
              <a
                href={pdfDownloadSrc}
                className="btn-primary btn-responsive section-header-action"
                download={page.portfolioPdf.filename || undefined}
              >
                <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {page.portfolioPdf.downloadLabel}
              </a>
            ) : null}
          </div>

          {pdfViewSrc ? (
            <div className="trade-pdf-frame">
              <iframe
                title={page.portfolioPdf.title}
                src={pdfViewSrc}
                className="trade-pdf-embed"
              />
            </div>
          ) : (
            <div className="trade-pdf-empty">
              <FileText className="h-8 w-8 text-[var(--muted)]" strokeWidth={1.25} />
              <p className="body-text text-[var(--muted)]">
                Portfolio PDF will appear here once uploaded in Content Studio.
              </p>
            </div>
          )}
        </Reveal>
      </div>

      <CuratedWorksSection
        copy={config.homepage.signatureWallArt}
        artworks={artworks}
      />

      <CollectionsSection config={config} artworks={artworks} />

      <div className="site-container page-section-end">
        <Reveal
          as="section"
          variant="slide-up"
          className="trade-section section-divider-top"
          aria-labelledby="trade-process-heading"
        >
          <div className="section-header-copy max-w-2xl">
            <p className="eyebrow">{page.tradeProcess.eyebrow}</p>
            <h2 id="trade-process-heading" className="section-title">
              {page.tradeProcess.title}
            </h2>
            <p className="body-text mt-3">{page.tradeProcess.subtitle}</p>
          </div>
          <ol className="trade-process-list" data-reveal-stagger>
            {page.tradeProcess.steps.map((step, index) => (
              <li key={step.title} className="trade-process-item">
                <span className="trade-process-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="trade-point-title">{step.title}</h3>
                  <p className="body-text mt-2">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal
          as="section"
          id="inquiry"
          variant="slide-up"
          className="trade-section section-divider-top"
          aria-labelledby="inquiry-heading"
        >
          <div className="trade-inquiry-layout">
            <div className="section-header-copy">
              <p className="eyebrow">{page.inquiryForm.eyebrow}</p>
              <h2 id="inquiry-heading" className="section-title">
                {page.inquiryForm.title}
              </h2>
              <p className="body-text mt-3">{page.inquiryForm.subtitle}</p>
            </div>
            <TradeInquiryForm copy={page.inquiryForm} />
          </div>
        </Reveal>
      </div>
    </>
  );
}
