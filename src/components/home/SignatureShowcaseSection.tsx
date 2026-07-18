import { Reveal } from "@/components/motion/Reveal";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { DEFAULT_HOMEPAGE, DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import type { CuratedWorksCopy, SignatureWallArtPageConfig } from "@/types/site-config";
import Link from "next/link";

export function SignatureShowcaseSection({
  copy,
  page,
}: {
  copy: CuratedWorksCopy;
  page: SignatureWallArtPageConfig | undefined;
}) {
  const resolvedCopy = copy ?? DEFAULT_HOMEPAGE.signatureWallArt;
  const projects = (page ?? DEFAULT_SIGNATURE_WALL_ART_PAGE).projects.items;
  const limit = Math.max(1, resolvedCopy.limit || 4);
  const items = projects.slice(0, limit);

  if (items.length === 0) {
    return null;
  }

  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="site-container section-block section-divider-top"
    >
      <div className="section-header mb-10">
        <div className="section-header-copy">
          <p className="eyebrow">{resolvedCopy.eyebrow}</p>
          <h2 className="section-title">{resolvedCopy.title}</h2>
          {resolvedCopy.subtitle ? (
            <p className="body-text mt-3 max-w-2xl">{resolvedCopy.subtitle}</p>
          ) : null}
        </div>
        {resolvedCopy.actionHref && resolvedCopy.actionLabel ? (
          <Link
            href={resolvedCopy.actionHref}
            className="btn-secondary btn-responsive section-header-action"
          >
            {resolvedCopy.actionLabel}
          </Link>
        ) : null}
      </div>

      <ul className="home-signature-showcase" data-reveal-stagger>
        {items.map((project, index) => (
          <li
            key={project.slug}
            className={`home-signature-showcase-item home-signature-showcase-item--${(index % 4) + 1}`}
          >
            <Link
              href={`/signature-wall-art/${project.slug}`}
              className="home-signature-showcase-link"
            >
              <div className="home-signature-showcase-media">
                {project.coverImageUrl ? (
                  <SoftImage
                    src={getArtworkImageSrc(project.coverImageUrl)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="home-signature-showcase-placeholder" aria-hidden />
                )}
              </div>
              <div className="home-signature-showcase-copy">
                <span className="home-signature-showcase-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="home-signature-showcase-title">{project.title}</h3>
                {project.summary ? (
                  <p className="body-text home-signature-showcase-summary">
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
