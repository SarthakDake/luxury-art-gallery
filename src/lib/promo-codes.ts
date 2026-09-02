import type { SiteOffer } from "@/types/site-config";

type PromoConfig = { offers: SiteOffer[] };

export interface PromoRule {
  code: string;
  headline: string;
  detail: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
}

// Hard-coded discount rules keyed by code; the CMS-editable `offers` list only
// supplies display copy (headline/detail) and which of these codes are advertised —
// it cannot itself change the actual discount math.
const PROMO_RULES: Record<string, Omit<PromoRule, "code" | "headline" | "detail">> = {
  CNJ5: { type: "percent", value: 5, minSubtotal: 4000 },
  SAVE500: { type: "fixed", value: 500, minSubtotal: 8000 },
  FESTIVE10: { type: "percent", value: 10, minSubtotal: 12000, maxDiscount: 2000 },
};

// Intersects the CMS-configured offers with the known PROMO_RULES, so an offer
// entered in the CMS with an unrecognized code is silently dropped rather than
// producing a broken/undiscounted promo.
export function getPromoOffers(config: PromoConfig): PromoRule[] {
  return config.offers
    .map((offer) => {
      const rule = PROMO_RULES[offer.code.trim().toUpperCase()];

      if (!rule) {
        return null;
      }

      return {
        code: offer.code.trim().toUpperCase(),
        headline: offer.headline,
        detail: offer.detail,
        ...rule,
      };
    })
    .filter((offer): offer is PromoRule => offer !== null);
}

export interface PromoApplication {
  valid: true;
  code: string;
  headline: string;
  discount: number;
  subtotal: number;
  finalTotal: number;
}

export interface PromoRejection {
  valid: false;
  message: string;
}

export type PromoResult = PromoApplication | PromoRejection;

export function applyPromoCode(
  code: string,
  subtotal: number,
  config: PromoConfig,
): PromoResult {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, message: "Enter a promo code." };
  }

  const offer = getPromoOffers(config).find((entry) => entry.code === normalizedCode);

  if (!offer) {
    return { valid: false, message: "This promo code is not valid." };
  }

  if (subtotal < offer.minSubtotal) {
    return {
      valid: false,
      message: `${offer.code} requires a subtotal of at least ₹${offer.minSubtotal.toLocaleString("en-IN")}.`,
    };
  }

  // Percent discounts are rounded to whole currency units before being capped.
  let discount =
    offer.type === "percent"
      ? Math.round((subtotal * offer.value) / 100)
      : offer.value;

  // maxDiscount caps percent-based offers (e.g. "10% off, up to ₹2000").
  if (offer.maxDiscount !== undefined) {
    discount = Math.min(discount, offer.maxDiscount);
  }

  // Guards against a fixed-amount discount (e.g. SAVE500) exceeding the subtotal,
  // which would otherwise push finalTotal negative.
  discount = Math.min(discount, subtotal);
  const finalTotal = Math.max(subtotal - discount, 0);

  return {
    valid: true,
    code: offer.code,
    headline: offer.headline,
    discount,
    subtotal,
    finalTotal,
  };
}
