import { getArtworks } from "@/lib/site-data";

export interface VerifiedCartLine {
  artworkId: string;
  size: string;
  price: number;
  quantity: number;
}

export interface CartLineInput {
  id: string;
  selectedSize: string;
  price: number;
  quantity: number;
}

const MAX_LINE_QUANTITY = 10;
const MAX_CART_LINES = 20;

export function getArtworkById(id: string) {
  return getArtworks().find((artwork) => artwork.id === id);
}

export function verifyCartLine(item: CartLineInput): VerifiedCartLine | null {
  if (
    typeof item.id !== "string" ||
    item.id.length === 0 ||
    typeof item.selectedSize !== "string" ||
    item.selectedSize.length === 0 ||
    typeof item.quantity !== "number" ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > MAX_LINE_QUANTITY
  ) {
    return null;
  }

  const artwork = getArtworkById(item.id);

  if (!artwork || !artwork.inStock) {
    return null;
  }

  const sizeOption = artwork.sizes.find(
    (entry) => entry.size === item.selectedSize,
  );

  if (!sizeOption) {
    return null;
  }

  return {
    artworkId: artwork.id,
    size: sizeOption.size,
    price: sizeOption.price,
    quantity: item.quantity,
  };
}

export function verifyCartItems(items: CartLineInput[]): VerifiedCartLine[] | null {
  if (items.length === 0 || items.length > MAX_CART_LINES) {
    return null;
  }

  const verifiedLines: VerifiedCartLine[] = [];

  for (const item of items) {
    const verified = verifyCartLine(item);

    if (!verified) {
      return null;
    }

    verifiedLines.push(verified);
  }

  return verifiedLines;
}

export function getArtworkTitle(artworkId: string) {
  return getArtworkById(artworkId)?.title ?? artworkId;
}
