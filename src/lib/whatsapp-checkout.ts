import type { Artwork } from "@/types/artwork";
import type { CartItem } from "@/lib/store";
import { formatPrice } from "@/types/artwork";
import { buildWhatsAppHref, normalizeWhatsAppNumber } from "@/lib/whatsapp";

type WhatsAppConfig = { whatsappNumber: string };

export function isWhatsAppCheckoutAvailable(config: WhatsAppConfig) {
  return Boolean(normalizeWhatsAppNumber(config.whatsappNumber ?? ""));
}

function getSiteBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3001"
  );
}

function getProductPageUrl(item: CartItem, baseUrl: string): string {
  return `${baseUrl}/art/${item.slug}`;
}

export function buildWhatsAppCheckoutMessage(
  items: CartItem[],
  subtotal: number,
  options?: {
    discount?: number;
    promoCode?: string;
    finalTotal?: number;
  },
): string {
  const baseUrl = getSiteBaseUrl();
  const useSerialNumbers = items.length > 1;
  const discount = options?.discount ?? 0;
  const finalTotal = options?.finalTotal ?? subtotal - discount;

  const lines = items.map((item, index) => {
    const priceLabel = formatPrice(item.price * item.quantity);
    const quantityLabel = item.quantity > 1 ? ` (x${item.quantity})` : "";
    const productUrl = getProductPageUrl(item, baseUrl);
    const prefix = useSerialNumbers ? `${index + 1}. ` : "";
    const details = `${prefix}${item.title} - ${item.selectedSize} - ${priceLabel}${quantityLabel}`;

    return `${details}\n${productUrl}`;
  });

  const discountLine =
    discount > 0 && options?.promoCode
      ? `\nPromo (${options.promoCode}): -${formatPrice(discount)}`
      : "";

  return `Hello, I would like to acquire the following pieces:\n\n${lines.join("\n\n")}${discountLine}\n\nSubtotal: ${formatPrice(subtotal)}\nTotal: ${formatPrice(finalTotal)}.`;
}

export function buildShowcaseEnquireMessage(
  artwork: Pick<Artwork, "title" | "slug">,
): string {
  const baseUrl = getSiteBaseUrl();
  const productUrl = `${baseUrl}/art/${artwork.slug}`;

  return `Hello, I would like to enquire about "${artwork.title}".\n\n${productUrl}`;
}

export function buildShowcaseEnquireUrl(
  artwork: Pick<Artwork, "title" | "slug">,
  config: WhatsAppConfig,
): string | null {
  if (!isWhatsAppCheckoutAvailable(config)) {
    return null;
  }

  const message = buildShowcaseEnquireMessage(artwork);

  return buildWhatsAppHref(config.whatsappNumber, message) || null;
}

export function buildWhatsAppCheckoutUrl(
  items: CartItem[],
  subtotal: number,
  config: WhatsAppConfig,
  options?: {
    discount?: number;
    promoCode?: string;
    finalTotal?: number;
  },
): string | null {
  if (!isWhatsAppCheckoutAvailable(config)) {
    return null;
  }

  const message = buildWhatsAppCheckoutMessage(items, subtotal, options);

  return buildWhatsAppHref(config.whatsappNumber, message) || null;
}
