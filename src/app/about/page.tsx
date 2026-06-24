import { getArtistProfile, getSiteConfig } from "@/lib/site-data";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";

interface PressFeature {
  publication: string;
  year: number;
  link: string;
}

export default async function AboutPage() {
  const config = await getSiteConfig();
  const profile = await getArtistProfile();
  const pressFeatures = profile.press as PressFeature[];
  const exhibitions = [...profile.exhibitions].sort((a, b) => b.year - a.year);
  const careerStart = Math.min(...profile.exhibitions.map((item) => item.year));
  const careerYears = new Date().getFullYear() - careerStart;
  const biographyLead = profile.biography.split(".")[0] + ".";
  const biographyRest = profile.biography.slice(biographyLead.length).trim();

  return (
    <>
      <div className="site-container page-shell page-section-end">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
        />

        <Reveal as="header" variant="slide-up" className="about-intro">
          <p className="eyebrow">About the Artist</p>
          <h1 className="page-title">{profile.artistName}</h1>
          <p className="body-text max-w-2xl">{profile.artistTagline}</p>
        </Reveal>

        <section aria-labelledby="biography-heading">
          <h2 id="biography-heading" className="sr-only">
            Biography
          </h2>

          <div className="about-bio-grid">
            <Reveal variant="slide-right" className="about-portrait-wrap">
              <div className="art-image-frame">
                {profile.portraitImageUrl ? (
                  <Image
                    src={profile.portraitImageUrl}
                    alt={`Portrait of ${profile.artistName}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                    <span className="font-serif text-5xl text-[var(--muted)]/40">
                      {profile.artistName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <p className="eyebrow">Artist Portrait</p>
                  </div>
                )}
              </div>
              <p className="about-portrait-caption">Studio Portrait</p>
            </Reveal>

            <Reveal variant="slide-left" className="about-bio-content">
              <p className="about-bio-lead">{biographyLead}</p>
              {biographyRest && <p className="body-text">{biographyRest}</p>}

              <div className="about-studio-note">
                <p className="eyebrow">Studio</p>
                <p className="body-text text-[var(--foreground)]">
                  {config.studioAddress}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal
            variant="slide-up"
            className="about-highlights"
            aria-label="Artist highlights"
          >
            <div className="about-highlight-item">
              <p className="about-highlight-value">
                {profile.exhibitions.length}
              </p>
              <p className="about-highlight-label">Major Exhibitions</p>
            </div>
            <div className="about-highlight-item">
              <p className="about-highlight-value">{careerYears}+</p>
              <p className="about-highlight-label">Years in Practice</p>
            </div>
            {pressFeatures.length > 0 ? (
              <div className="about-highlight-item">
                <p className="about-highlight-value">{pressFeatures.length}</p>
                <p className="about-highlight-label">Press Features</p>
              </div>
            ) : null}
          </Reveal>
        </section>
      </div>

      <Reveal
        as="section"
        variant="slide-up"
        aria-labelledby="exhibitions-heading"
        className="surface-section about-section"
      >
        <div className="site-container">
          <div className="about-section-header">
            <p className="eyebrow">Exhibition History</p>
            <h2 id="exhibitions-heading" className="section-title">
              Selected Shows
            </h2>
            <p className="body-text max-w-2xl">
              A record of studio presentations and collection launches through
              Colors N Joy, rooted in light, material, and stillness.
            </p>
          </div>

          <ol className="about-timeline" data-reveal-stagger>
            {exhibitions.map((exhibition) => (
              <li
                key={`${exhibition.year}-${exhibition.title}`}
                className="about-timeline-item"
                data-reveal="slide-up"
              >
                <p className="about-timeline-year">{exhibition.year}</p>
                <div className="about-timeline-body">
                  <h3 className="about-timeline-title">{exhibition.title}</h3>
                  <p className="about-timeline-location">
                    {exhibition.location}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {pressFeatures.length > 0 ? (
        <Reveal
          as="section"
          variant="slide-up"
          aria-labelledby="press-heading"
          className="site-container about-section"
        >
          <div className="about-section-header">
            <p className="eyebrow">Recognition</p>
            <h2 id="press-heading" className="section-title">
              Press & Selected Awards
            </h2>
            <p className="body-text max-w-2xl">
              Critical writing and editorial features on the work and its evolving
              dialogue with contemporary minimalism.
            </p>
          </div>

          <ul className="about-press-grid" data-reveal-stagger>
            {pressFeatures.map((item) => (
              <li key={`${item.publication}-${item.year}`} data-reveal="scale-in">
                <article className="about-press-card">
                  <p className="eyebrow">{item.year}</p>
                  <h3 className="section-title">{item.publication}</h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-text"
                  >
                    Read Feature
                  </a>
                </article>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal
        variant="slide-up"
        className="site-container about-section about-cta-wrap"
      >
        <div className="about-cta">
          <div className="about-cta-copy">
            <p className="eyebrow">Explore the Collection</p>
            <h2 className="section-title">
              Discover works by {profile.artistName}
            </h2>
            <p className="body-text">
              Browse original paintings and sculptures, or reach out for
              commissions and private viewings.
            </p>
          </div>
          <div className="about-cta-actions">
            <Link href="/shop" className="btn-primary btn-responsive">
              View Gallery
            </Link>
            <Link href="/contact" className="btn-secondary btn-responsive">
              Get in Touch
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
