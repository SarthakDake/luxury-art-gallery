import { assertAdminSession } from "@/lib/admin";
import { getArtworks, summarizeMirrorResults, saveArtworks } from "@/lib/site-data";
import { nextArtworkId, slugify } from "@/lib/site-data/slug";
import type { Artwork, ArtworkSize, ArtworkVideo } from "@/types/artwork";

export const dynamic = "force-dynamic";

function normalizeArtwork(raw: Artwork, existing: Artwork[]): Artwork {
  const title = raw.title.trim();
  const slug = raw.slug?.trim() || slugify(title);
  const id = raw.id?.trim() || nextArtworkId(existing.filter((item) => item.id !== raw.id));

  const sizes = (raw.sizes ?? [])
    .filter((entry) => entry.size.trim() && Number.isFinite(entry.price))
    .map(
      (entry): ArtworkSize => ({
        size: entry.size.trim(),
        price: Number(entry.price),
      }),
    );

  const galleryImages = (raw.galleryImages ?? [])
    .map((image) => image.trim())
    .filter(Boolean);

  const videos = (raw.videos ?? [])
    .filter((video) => video.url.trim())
    .map(
      (video): ArtworkVideo => ({
        url: video.url.trim(),
        ...(video.title?.trim() ? { title: video.title.trim() } : {}),
        ...(video.poster?.trim() ? { poster: video.poster.trim() } : {}),
        ...(video.type ? { type: video.type } : {}),
      }),
    );

  const defaultSelectedSizeIndex = Math.min(
    Math.max(raw.defaultSelectedSizeIndex ?? 0, 0),
    Math.max(sizes.length - 1, 0),
  );

  const imageUrl = raw.imageUrl.trim() || galleryImages[0] || "";

  return {
    id,
    title,
    slug,
    imageUrl,
    ...(galleryImages.length > 0 ? { galleryImages } : {}),
    category: raw.category.trim(),
    subcategory: raw.subcategory.trim(),
    material: raw.material.trim(),
    inStock: Boolean(raw.inStock),
    showcaseOnly: raw.showcaseOnly === true,
    ...(raw.showcaseOnly === true && raw.showcaseEnquireLabel?.trim()
      ? { showcaseEnquireLabel: raw.showcaseEnquireLabel.trim() }
      : {}),
    description: raw.description.trim(),
    sizes,
    defaultSelectedSizeIndex,
    ...(raw.dispatchNote?.trim() ? { dispatchNote: raw.dispatchNote.trim() } : {}),
    ...(raw.careGuide?.trim() ? { careGuide: raw.careGuide.trim() } : {}),
    ...(raw.shippingReturns?.trim()
      ? { shippingReturns: raw.shippingReturns.trim() }
      : {}),
    ...(raw.beforeYouBuy?.trim() ? { beforeYouBuy: raw.beforeYouBuy.trim() } : {}),
    ...(videos.length > 0 ? { videos } : {}),
  };
}

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ artworks: await getArtworks() });
}

export async function PUT(request: Request) {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { artworks?: Artwork[] };

  try {
    payload = (await request.json()) as { artworks?: Artwork[] };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!Array.isArray(payload.artworks)) {
    return Response.json({ error: "artworks array is required." }, { status: 400 });
  }

  const normalized: Artwork[] = [];

  for (const entry of payload.artworks) {
    const artwork = normalizeArtwork(entry, normalized);

    const needsSizes = !artwork.showcaseOnly;
    if (
      !artwork.title ||
      !artwork.slug ||
      !artwork.imageUrl ||
      (needsSizes && artwork.sizes.length === 0)
    ) {
      return Response.json(
        {
          error: artwork.showcaseOnly
            ? "Each showcase artwork needs a title and cover image."
            : "Each artwork needs a title, cover image, at least one size, category, and description.",
        },
        { status: 400 },
      );
    }

    if (normalized.some((item) => item.slug === artwork.slug && item.id !== artwork.id)) {
      return Response.json({ error: `Duplicate slug: ${artwork.slug}` }, { status: 400 });
    }

    normalized.push(artwork);
  }

  try {
    const mirrors = await saveArtworks(normalized);
    const mirrorWarning = summarizeMirrorResults(mirrors);

    return Response.json({
      artworks: normalized,
      mirrors,
      ...(mirrorWarning ? { mirrorWarning } : {}),
    });
  } catch (error) {
    console.error("[content] save artworks failed:", error);
    return Response.json({ error: "Could not save artworks." }, { status: 500 });
  }
}
