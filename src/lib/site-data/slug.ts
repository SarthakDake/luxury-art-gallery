import type { Artwork } from "@/types/artwork";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nextArtworkId(artworks: Artwork[]): string {
  const numbers = artworks.map((artwork) => {
    const match = artwork.id.match(/^art-(\d+)$/i);
    return match ? Number.parseInt(match[1], 10) : 0;
  });

  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `art-${String(next).padStart(3, "0")}`;
}

export function buildArtworkImageFilename(
  slug: string,
  role: "cover" | "gallery" | "video-poster",
  extension: string,
  index = 0,
): string {
  const safeSlug = slugify(slug) || "artwork";

  if (role === "cover") {
    return `${safeSlug}-cover${extension}`;
  }

  if (role === "video-poster") {
    return `${safeSlug}-video-poster${extension}`;
  }

  return `${safeSlug}-${index + 1}${extension}`;
}

export function buildPortraitFilename(extension: string): string {
  return `artist-portrait${extension}`;
}
