import { getSiteUrl } from "@/lib/auth-url";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [artworks, config] = await Promise.all([getArtworks(), getSiteConfig()]);
  const now = new Date();
  const signaturePage =
    config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signature-wall-art`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/for-interior-designers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const signatureProjectRoutes: MetadataRoute.Sitemap =
    signaturePage.projects.items.map((project) => ({
      url: `${baseUrl}/signature-wall-art/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

  const artworkRoutes: MetadataRoute.Sitemap = artworks.map((artwork) => ({
    url: `${baseUrl}/art/${artwork.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...signatureProjectRoutes, ...artworkRoutes];
}
