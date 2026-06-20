import type { ArtistProfile } from "@/types/site-config";
import type { SiteConfig } from "@/types/site-config";
import type { Artwork } from "@/types/artwork";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "src/data");

const ARTWORKS_PATH = path.join(DATA_DIR, "artworks.json");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function writeJsonFile(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function getArtworks(): Artwork[] {
  return readJsonFile<Artwork[]>(ARTWORKS_PATH);
}

export function getSiteConfig(): SiteConfig {
  return readJsonFile<SiteConfig>(CONFIG_PATH);
}

export function getArtistProfile(): ArtistProfile {
  return readJsonFile<ArtistProfile>(PROFILE_PATH);
}

export function saveArtworks(artworks: Artwork[]) {
  writeJsonFile(ARTWORKS_PATH, artworks);
  revalidatePath("/");
  revalidatePath("/shop");
}

export function saveSiteConfig(config: SiteConfig) {
  writeJsonFile(CONFIG_PATH, config);
  revalidatePath("/", "layout");
}

export function saveArtistProfile(profile: ArtistProfile) {
  writeJsonFile(PROFILE_PATH, profile);
  revalidatePath("/about");
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
