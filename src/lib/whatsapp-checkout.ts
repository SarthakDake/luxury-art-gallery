import config from "@/data/config.json";
import type { CartItem } from "@/lib/store";
import { formatPrice } from "@/types/artwork";

export function isWhatsAppCheckoutAvailable() {
  return Boolean(config.whatsappNumber?.trim());
}

export function buildWhatsAppCheckoutMessage(
  items: CartItem[],
  total: number,
): string {
  const lines = items.map((item) => {
    const priceLabel = formatPrice(item.price * item.quantity);
    const quantityLabel = item.quantity > 1 ? ` (x${item.quantity})` : "";

    return `${item.title} - ${item.selectedSize} - ${priceLabel}${quantityLabel}`;
  });

  return `Hello, I would like to acquire the following pieces: ${lines.join(", ")}. Total: ${formatPrice(total)}.`;
}

export function buildWhatsAppCheckoutUrl(
  items: CartItem[],
  total: number,
): string | null {
  if (!isWhatsAppCheckoutAvailable()) {
    return null;
  }

  const message = buildWhatsAppCheckoutMessage(items, total);

  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
