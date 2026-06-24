import "server-only";

import type { ArtistProfile } from "@/types/site-config";
import type { SiteConfig } from "@/types/site-config";
import type { Artwork } from "@/types/artwork";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");

export const SITE_CONTENT_KEYS = {
  artworks: "artworks",
  config: "config",
  profile: "profile",
} as const;

export type SiteContentKey =
  (typeof SITE_CONTENT_KEYS)[keyof typeof SITE_CONTENT_KEYS];

const CONTENT_PATHS: Record<SiteContentKey, string> = {
  artworks: path.join(DATA_DIR, "artworks.json"),
  config: path.join(DATA_DIR, "config.json"),
  profile: path.join(DATA_DIR, "profile.json"),
};

export const CONTENT_REPO_PATHS: Record<SiteContentKey, string> = {
  artworks: "src/data/artworks.json",
  config: "src/data/config.json",
  profile: "src/data/profile.json",
};

export function readContentFile<T>(key: SiteContentKey): T {
  const raw = fs.readFileSync(CONTENT_PATHS[key], "utf8");
  return JSON.parse(raw) as T;
}

export function writeContentFile(key: SiteContentKey, data: unknown) {
  const filePath = CONTENT_PATHS[key];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function readArtworksFromFile(): Artwork[] {
  return readContentFile<Artwork[]>("artworks");
}

export function readSiteConfigFromFile(): SiteConfig {
  return readContentFile<SiteConfig>("config");
}

export function readArtistProfileFromFile(): ArtistProfile {
  return readContentFile<ArtistProfile>("profile");
}
