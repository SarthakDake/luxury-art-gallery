import { SignatureShowcaseSection } from "@/components/home/SignatureShowcaseSection";
import { Reveal } from "@/components/motion/Reveal";
import { TradeInquiryForm } from "@/components/trade/TradeInquiryForm";
import { RichText } from "@/components/ui/RichText";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { DEFAULT_FOR_INTERIOR_DESIGNERS } from "@/lib/site-config/defaults";
import { getSiteDocumentSrc } from "@/lib/site-document";
import type { SiteConfig } from "@/types/site-config";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

export function ForInteriorDesignersView({
  config,
}: {
  config: SiteConfig;
}) {
  const page = config.forInteriorDesigners ?? DEFAULT_FOR_INTERIOR_DESIGNERS;
  const heroImage =
    page.hero.imageUrl.trim() || DEFAULT_FOR_INTERIOR_DESIGNERS.hero.imageUrl;
  const pdfUrl =
    page.portfolioPdf.url.trim() || DEFAULT_FOR_INTERIOR_DESIGNERS.portfolioPdf.url;
  const pdfFilename =
    page.portfolioPdf.filename.trim() ||
    DEFAULT_FOR_INTERIOR_DESIGNERS.portfolioPdf.filename;
  const pdfViewSrc = pdfUrl
    ? getSiteDocumentSrc(pdfUrl, { filename: pdfFilename })
    : "";
  const pdfDownloadSrc = pdfUrl
    ? getSiteDocumentSrc(pdfUrl, {
        download: true,
        filename: pdfFilename || "designer-portfolio.pdf",
      })
    : "";

  return (
    <>
      <section className="hero-block hero-block--image trade-hero">
        <SoftImage
          src={getArtworkImageSrc(heroImage)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-media object-cover"
        />
        <div className="hero-overlay" aria-hidden />

        <div className="site-container hero-inner trade-hero-inner">
          <div className="hero-content">
            <Reveal as="p" variant="fade-in" immediate className="hero-eyebrow">
              {page.hero.eyebrow}
            </Reveal>
            <Reveal as="h1" variant="slide-up" immediate delay={80} className="hero-title">
              {page.hero.title}
            </Reveal>
            <Reveal
              as="div"
              variant="slide-up"
              immediate
              delay={140}
              className="hero-subtitle"
            >
              <RichText content={page.hero.subtitle} />
            </Reveal>
            <Reveal
              variant="slide-up"
              immediate
              delay={220}
              className="hero-actions hero-actions--on-dark"
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

      <div className="site-container trade-page-body page-section-end">

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
            <RichText content={page.whyPartner.subtitle} className="body-text mt-3" />
          </div>
          <ul className="trade-point-grid" data-reveal-stagger>
            {page.whyPartner.points.map((point) => (
              <li key={point.title} className="trade-point-item">
                <h3 className="trade-point-title">{point.title}</h3>
                <RichText content={point.description} className="body-text" />
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
            <RichText content={page.benefits.subtitle} className="body-text mt-3" />
          </div>
          <ul className="trade-point-grid" data-reveal-stagger>
            {page.benefits.items.map((item) => (
              <li key={item.title} className="trade-point-item">
                <h3 className="trade-point-title">{item.title}</h3>
                <RichText content={item.description} className="body-text" />
              </li>
            ))}
          </ul>
        </Reveal>

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
            <RichText content={page.tradeProcess.subtitle} className="body-text mt-3" />
          </div>
          <ol className="trade-process-list" data-reveal-stagger>
            {page.tradeProcess.steps.map((step, index) => (
              <li key={step.title} className="trade-process-item">
                <span className="trade-process-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="trade-point-title">{step.title}</h3>
                  <RichText content={step.description} className="body-text mt-2" />
                </div>
              </li>
            ))}
          </ol>
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
              <RichText content={page.portfolioPdf.subtitle} className="body-text mt-3" />
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

      <SignatureShowcaseSection
        copy={config.homepage.signatureWallArt}
        page={config.signatureWallArtPage}
      />

      <div className="site-container page-section-end">
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
              <RichText content={page.inquiryForm.subtitle} className="body-text mt-3" />
            </div>
            <TradeInquiryForm copy={page.inquiryForm} />
          </div>
        </Reveal>
      </div>
    </>
  );
}
