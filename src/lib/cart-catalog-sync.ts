import type { Artwork } from "@/types/artwork";
import type { CartItem } from "@/lib/store";

const MAX_LINE_QUANTITY = 10;

export interface CartCatalogSyncResult {
  items: CartItem[];
  removedTitles: string[];
  priceUpdatedTitles: string[];
  changed: boolean;
}

export function syncCartWithCatalog(
  items: CartItem[],
  artworks: Artwork[],
): CartCatalogSyncResult {
  if (items.length === 0 || artworks.length === 0) {
    return {
      items,
      removedTitles: [],
      priceUpdatedTitles: [],
      changed: false,
    };
  }

  const catalogById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const nextItems: CartItem[] = [];
  const removedTitles: string[] = [];
  const priceUpdatedTitles: string[] = [];

  for (const item of items) {
    const artwork = catalogById.get(item.id);

    if (!artwork || artwork.showcaseOnly || !artwork.inStock) {
      removedTitles.push(item.title);
      continue;
    }

    const sizeOption = artwork.sizes.find((entry) => entry.size === item.selectedSize);

    if (!sizeOption) {
      removedTitles.push(item.title);
      continue;
    }

    const quantity = Math.min(Math.max(item.quantity, 1), MAX_LINE_QUANTITY);
    const priceChanged = item.price !== sizeOption.price;

    if (priceChanged) {
      priceUpdatedTitles.push(item.title);
    }

    nextItems.push({
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug,
      imageUrl: artwork.imageUrl,
      selectedSize: sizeOption.size,
      price: sizeOption.price,
      quantity,
    });
  }

  const changed =
    removedTitles.length > 0 ||
    priceUpdatedTitles.length > 0 ||
    serializeCartItems(nextItems) !== serializeCartItems(items);

  return {
    items: changed ? nextItems : items,
    removedTitles,
    priceUpdatedTitles,
    changed,
  };
}

function serializeCartItems(items: CartItem[]): string {
  return items
    .map(
      (item) =>
        `${item.id}|${item.selectedSize}|${item.price}|${item.quantity}|${item.title}|${item.slug}|${item.imageUrl}`,
    )
    .join(";;");
}

export function formatCartSyncNotice(result: CartCatalogSyncResult): string | null {
  if (!result.changed) {
    return null;
  }

  const parts: string[] = [];

  if (result.removedTitles.length > 0) {
    const label =
      result.removedTitles.length === 1
        ? result.removedTitles[0]
        : `${result.removedTitles.length} items`;
    parts.push(`${label} ${result.removedTitles.length === 1 ? "was" : "were"} removed (unavailable or display-only).`);
  }

  if (result.priceUpdatedTitles.length > 0) {
    const label =
      result.priceUpdatedTitles.length === 1
        ? result.priceUpdatedTitles[0]
        : `${result.priceUpdatedTitles.length} items`;
    parts.push(`${label} ${result.priceUpdatedTitles.length === 1 ? "has" : "have"} updated pricing.`);
  }

  return parts.join(" ");
}
