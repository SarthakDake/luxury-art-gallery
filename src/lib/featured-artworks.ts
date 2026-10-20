import type { Artwork } from "@/types/artwork";

function categoryKey(artwork: Artwork): string {
  const trimmed = artwork.category.trim();
  return trimmed || "Uncategorized";
}

/**
 * Picks homepage “Selected Works” with category diversity: at least one piece
 * per category when possible, then round-robin across categories for remaining
 * slots (instead of the first N items in catalog order).
 */
export function selectFeaturedArtworks(
  artworks: Artwork[],
  limit: number,
): Artwork[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0 || artworks.length === 0) {
    return [];
  }

  if (artworks.length <= safeLimit) {
    return [...artworks];
  }

  const categoryOrder: string[] = [];
  const byCategory = new Map<string, Artwork[]>();

  for (const artwork of artworks) {
    const key = categoryKey(artwork);
    if (!byCategory.has(key)) {
      categoryOrder.push(key);
      byCategory.set(key, []);
    }
    byCategory.get(key)!.push(artwork);
  }

  const picked: Artwork[] = [];
  const pickedIds = new Set<string>();
  const nextIndex = new Map<string, number>();

  for (const key of categoryOrder) {
    if (picked.length >= safeLimit) {
      break;
    }

    const list = byCategory.get(key)!;
    if (list.length === 0) {
      continue;
    }

    picked.push(list[0]);
    pickedIds.add(list[0].id);
    nextIndex.set(key, 1);
  }

  while (picked.length < safeLimit) {
    let added = false;

    for (const key of categoryOrder) {
      if (picked.length >= safeLimit) {
        break;
      }

      const list = byCategory.get(key)!;
      let index = nextIndex.get(key) ?? 0;

      while (index < list.length && pickedIds.has(list[index].id)) {
        index += 1;
      }

      if (index < list.length) {
        picked.push(list[index]);
        pickedIds.add(list[index].id);
        nextIndex.set(key, index + 1);
        added = true;
      }
    }

    if (!added) {
      break;
    }
  }

  return picked;
}
