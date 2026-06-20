export interface ArtworkSize {
  size: string;
  price: number;
}

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  /** Public path under /artworks — .jpg, .jpeg, .png, .webp, .heic, or .heif */
  imageUrl: string;
  galleryImages?: string[];
  category: string;
  subcategory: string;
  material: string;
  inStock: boolean;
  description: string;
  sizes: ArtworkSize[];
  defaultSelectedSizeIndex?: number;
  dispatchNote?: string;
  careGuide?: string;
  shippingReturns?: string;
  beforeYouBuy?: string;
}

export function getGalleryImages(artwork: Artwork): string[] {
  if (artwork.galleryImages && artwork.galleryImages.length > 0) {
    return artwork.galleryImages;
  }

  return [artwork.imageUrl];
}

export function getDefaultSize(artwork: Artwork): ArtworkSize {
  const index = artwork.defaultSelectedSizeIndex ?? 0;
  return artwork.sizes[index] ?? artwork.sizes[0];
}

export function getStartingPrice(artwork: Artwork): number {
  return Math.min(...artwork.sizes.map((size) => size.price));
}

export function formatPrice(price: number): string {
  const rounded = Math.round(price);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `₹${formatted}`;
}

export function formatPriceFrom(artwork: Artwork): string {
  return `From ${formatPrice(getStartingPrice(artwork))}`;
}
