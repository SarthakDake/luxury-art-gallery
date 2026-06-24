import "server-only";
import type { ArtistProfile, SiteConfig } from "@/types/site-config";
import type { Artwork } from "@/types/artwork";
import {
  readArtistProfileFromFile,
  readArtworksFromFile,
  readSiteConfigFromFile,
} from "@/lib/site-data/files";
import {
  summarizeMirrorResults,
  type ContentMirrorResult,
} from "@/lib/content-json-mirror";
import { loadSiteContent, persistSiteContent } from "@/lib/site-data/store";
import fs from "fs";
import path from "path";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const getArtworksCached = unstable_cache(
  async () =>
    loadSiteContent<Artwork[]>("artworks", readArtworksFromFile),
  ["site-content", "artworks"],
  { tags: ["site-content-artworks"] },
);

const getSiteConfigCached = unstable_cache(
  async () =>
    loadSiteContent<SiteConfig>("config", readSiteConfigFromFile),
  ["site-content", "config"],
  { tags: ["site-content-config"] },
);

const getArtistProfileCached = unstable_cache(
  async () =>
    loadSiteContent<ArtistProfile>("profile", readArtistProfileFromFile),
  ["site-content", "profile"],
  { tags: ["site-content-profile"] },
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

export async function saveArtworks(artworks: Artwork[]) {
  const mirrors = await persistSiteContent("artworks", artworks);
  revalidateTag("site-content-artworks", "max");
  revalidatePath("/");
  revalidatePath("/shop");
  return mirrors;
}

export async function saveSiteConfig(config: SiteConfig) {
  const mirrors = await persistSiteContent("config", config);
  revalidateTag("site-content-config", "max");
  revalidatePath("/", "layout");
  return mirrors;
}

export async function saveArtistProfile(profile: ArtistProfile) {
  const mirrors = await persistSiteContent("profile", profile);
  revalidateTag("site-content-profile", "max");
  revalidatePath("/about");
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
