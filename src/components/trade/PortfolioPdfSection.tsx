"use client";

import { PortfolioDownloadForm } from "@/components/trade/PortfolioDownloadForm";
import { RichText } from "@/components/ui/RichText";
import type { ForInteriorDesignersConfig } from "@/types/site-config";
import { Download, FileText } from "lucide-react";
import { useCallback, useState } from "react";

const SESSION_PREFIX = "cnj-portfolio-unlock:";

function sessionKeyForPdf(pdfUrl: string): string {
  return `${SESSION_PREFIX}${pdfUrl.trim()}`;
}

function readUnlocked(pdfUrl: string): boolean {
  if (typeof window === "undefined" || !pdfUrl.trim()) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(sessionKeyForPdf(pdfUrl)) === "1";
  } catch {
    return false;
  }
}

function writeUnlocked(pdfUrl: string): void {
  if (!pdfUrl.trim()) {
    return;
  }

  try {
    window.sessionStorage.setItem(sessionKeyForPdf(pdfUrl), "1");
  } catch {
    // ignore quota / private mode
  }
}

export function PortfolioPdfSection({
  copy,
  pdfUrl,
  pdfViewSrc,
  pdfDownloadSrc,
  bypassGate = false,
}: {
  copy: ForInteriorDesignersConfig["portfolioPdf"];
  pdfUrl: string;
  pdfViewSrc: string;
  pdfDownloadSrc: string;
  bypassGate?: boolean;
}) {
  const [sessionUnlocked, setSessionUnlocked] = useState(() => readUnlocked(pdfUrl));
  const unlocked = bypassGate || sessionUnlocked;

  const handleUnlocked = useCallback(() => {
    writeUnlocked(pdfUrl);
    setSessionUnlocked(true);
  }, [pdfUrl]);

  const showPdf = Boolean(pdfViewSrc) && unlocked;

  return (
    <section
      id="portfolio-pdf"
      className="trade-section section-divider-top"
      aria-labelledby="portfolio-pdf-heading"
    >
      <div className="section-header mb-8">
        <div className="section-header-copy max-w-2xl">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="portfolio-pdf-heading" className="section-title">
            {copy.title}
          </h2>
          <RichText content={copy.subtitle} className="body-text mt-3" />
        </div>
        {showPdf && pdfDownloadSrc ? (
          <a
            href={pdfDownloadSrc}
            className="btn-primary btn-responsive section-header-action"
            download={copy.filename || undefined}
          >
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {copy.downloadLabel}
          </a>
        ) : null}
      </div>

      {!pdfViewSrc ? (
        <div className="trade-pdf-empty">
          <FileText className="h-8 w-8 text-[var(--muted)]" strokeWidth={1.25} />
          <p className="body-text text-[var(--muted)]">
            Portfolio PDF will appear here once uploaded in Content Studio.
          </p>
        </div>
      ) : !unlocked ? (
        <div className="trade-portfolio-gate card-panel">
          <PortfolioDownloadForm onUnlocked={handleUnlocked} />
        </div>
      ) : (
        <div className="trade-pdf-frame">
          <object
            data={pdfViewSrc}
            type="application/pdf"
            className="trade-pdf-embed"
            aria-label={copy.title}
          >
            <iframe title={copy.title} src={pdfViewSrc} className="trade-pdf-embed" />
          </object>
          <p className="trade-pdf-fallback-note">
            If the preview does not appear,{" "}
            <a href={pdfViewSrc} target="_blank" rel="noopener noreferrer">
              open the portfolio PDF
            </a>
            {pdfDownloadSrc ? (
              <>
                {" "}
                or{" "}
                <a href={pdfDownloadSrc} download={copy.filename || undefined}>
                  download it
                </a>
              </>
            ) : null}
            .
          </p>
        </div>
      )}
    </section>
  );
}
