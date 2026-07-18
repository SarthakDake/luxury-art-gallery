import "server-only";
import type { ArtistProfile, SiteConfig } from "@/types/site-config";
import type { Artwork } from "@/types/artwork";
import { normalizeArtistProfile } from "@/lib/artist-profile";
import { normalizeSiteConfig } from "@/lib/site-config";
import {
  readArtistProfileFromFile,
  readArtworksFromFile,
  readSiteConfigFromFile,
} from "@/lib/site-data/files";
import {
  SITE_CONTENT_ISR_SECONDS,
  SITE_CONTENT_TAGS,
} from "@/lib/site-data/cache";
import {
  summarizeMirrorResults,
  type ContentMirrorResult,
} from "@/lib/content-json-mirror";
import { loadSiteContent, persistSiteContent } from "@/lib/site-data/store";
import fs from "fs";
import path from "path";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const getArtworksCached = unstable_cache(
  async () => loadSiteContent<Artwork[]>("artworks", readArtworksFromFile),
  ["site-content", SITE_CONTENT_TAGS.artworks],
  {
    tags: [SITE_CONTENT_TAGS.artworks],
    revalidate: SITE_CONTENT_ISR_SECONDS,
  },
);

const getSiteConfigCached = unstable_cache(
  async () => {
    const raw = await loadSiteContent<unknown>("config", readSiteConfigFromFile);
    return normalizeSiteConfig(raw);
  },
  ["site-content", SITE_CONTENT_TAGS.config],
  {
    tags: [SITE_CONTENT_TAGS.config],
    revalidate: SITE_CONTENT_ISR_SECONDS,
  },
);

const getArtistProfileCached = unstable_cache(
  async () => {
    const raw = await loadSiteContent<unknown>("profile", readArtistProfileFromFile);
    return normalizeArtistProfile(raw);
  },
  ["site-content", SITE_CONTENT_TAGS.profile],
  {
    tags: [SITE_CONTENT_TAGS.profile],
    revalidate: SITE_CONTENT_ISR_SECONDS,
  },
);

export async function getArtworks(): Promise<Artwork[]> {
  return getArtworksCached();
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return getSiteConfigCached();
}

export async function getArtistProfile(): Promise<ArtistProfile> {
  return getArtistProfileCached();
}

export type { ContentMirrorResult };
export { summarizeMirrorResults };
export { SITE_CONTENT_ISR_SECONDS, SITE_CONTENT_TAGS };

function revalidateArtworkRoutes(artworks: Artwork[]) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/api/site/artworks");

  for (const artwork of artworks) {
    if (artwork.slug) {
      revalidatePath(`/art/${artwork.slug}`);
    }
  }
}

export async function saveArtworks(artworks: Artwork[]) {
  const mirrors = await persistSiteContent("artworks", artworks);
  revalidateTag(SITE_CONTENT_TAGS.artworks, "max");
  revalidateArtworkRoutes(artworks);
  return mirrors;
}

export async function saveSiteConfig(config: SiteConfig) {
  const mirrors = await persistSiteContent("config", config);
  revalidateTag(SITE_CONTENT_TAGS.config, "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/signature-wall-art");
  revalidatePath("/for-interior-designers");
  revalidatePath("/portfolio");
  revalidatePath("/about");
  return mirrors;
}

export async function saveArtistProfile(profile: ArtistProfile) {
  const mirrors = await persistSiteContent("profile", profile);
  revalidateTag(SITE_CONTENT_TAGS.profile, "max");
  revalidatePath("/about");
  revalidatePath("/for-interior-designers");
  revalidatePath("/", "layout");
  return mirrors;
}

export function getPublicDir(...segments: string[]) {
  return path.join(process.cwd(), "public", ...segments);
}

export function saveUploadedFile(
  directory: string,
  filename: string,
  buffer: Buffer,
): string {
  const safeName = path.basename(filename);
  const targetDir = path.join(process.cwd(), "public", directory);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, safeName), buffer);
  return `/${directory}/${safeName}`.replace(/\/+/g, "/");
}
