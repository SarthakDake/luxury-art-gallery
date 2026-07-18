/** Digits-only WhatsApp number for wa.me links. */
export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppHref(
  whatsappNumber: string,
  message: string,
): string {
  const number = normalizeWhatsAppNumber(whatsappNumber);
  if (!number) {
    return "";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
