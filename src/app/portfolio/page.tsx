import { CuratedCollectionPage } from "@/components/curated/CuratedCollectionPage";
import { Reveal } from "@/components/motion/Reveal";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { getArtistProfile, getArtworks, getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const copy = config.homepage.portfolio;

  return {
    title: copy.title,
    description:
      copy.subtitle || "Artist portfolio — selected works from Colors N Joy.",
  };
}

export default async function PortfolioPage() {
  const [config, artworks, profile] = await Promise.all([
    getSiteConfig(),
    getArtworks(),
    getArtistProfile(),
  ]);

  const copy = config.homepage.portfolio;
  const exhibitions = [...profile.exhibitions]
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);

  return (
    <CuratedCollectionPage
      copy={copy}
      artworks={artworks}
      breadcrumbLabel="Portfolio"
      intro={
        <Reveal
          as="section"
          variant="slide-up"
          className="about-bio-grid mb-12"
          aria-labelledby="portfolio-artist-heading"
        >
          <div className="about-portrait-wrap">
            <div className="art-image-frame">
              {profile.portraitImageUrl ? (
                <ArtworkImage
                  src={profile.portraitImageUrl}
                  alt={`Portrait of ${profile.artistName}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-5xl text-[var(--muted)]/40">
                    {profile.artistName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                </div>
              )}
            </div>
            <p className="about-portrait-caption">Studio Portrait</p>
          </div>

          <div className="about-bio-content">
            <p className="eyebrow">The Artist</p>
            <h2 id="portfolio-artist-heading" className="section-title">
              {profile.artistName}
            </h2>
            <p className="body-text mt-4">{profile.artistTagline}</p>

            {exhibitions.length > 0 ? (
              <ul className="mt-8 space-y-3">
                {exhibitions.map((item) => (
                  <li
                    key={`${item.year}-${item.title}`}
                    className="border-t border-[var(--border)] pt-3 text-sm"
                  >
                    <span className="text-[var(--muted)]">{item.year}</span>
                    <span className="mx-2 text-[var(--muted)]">·</span>
                    <span className="text-[var(--foreground)]">{item.title}</span>
                    {item.location ? (
                      <span className="mt-1 block text-[var(--muted)]">
                        {item.location}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn-secondary btn-responsive">
                About us
              </Link>
              <Link href="/shop" className="btn-primary btn-responsive">
                Shop
              </Link>
            </div>
          </div>
        </Reveal>
      }
    />
  );
}
