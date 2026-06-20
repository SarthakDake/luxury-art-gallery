import config from "@/data/config.json";

export interface PromoRule {
  code: string;
  headline: string;
  detail: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
}

const PROMO_RULES: Record<string, Omit<PromoRule, "code" | "headline" | "detail">> = {
  CNJ5: { type: "percent", value: 5, minSubtotal: 4000 },
  SAVE500: { type: "fixed", value: 500, minSubtotal: 8000 },
  FESTIVE10: { type: "percent", value: 10, minSubtotal: 12000, maxDiscount: 2000 },
};

export function getPromoOffers(): PromoRule[] {
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

export function applyPromoCode(code: string, subtotal: number): PromoResult {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, message: "Enter a promo code." };
  }

  const offer = getPromoOffers().find((entry) => entry.code === normalizedCode);

  if (!offer) {
    return { valid: false, message: "This promo code is not valid." };
  }

  if (subtotal < offer.minSubtotal) {
    return {
      valid: false,
      message: `${offer.code} requires a subtotal of at least ₹${offer.minSubtotal.toLocaleString("en-IN")}.`,
    };
  }

  let discount =
    offer.type === "percent"
      ? Math.round((subtotal * offer.value) / 100)
      : offer.value;

  if (offer.maxDiscount !== undefined) {
    discount = Math.min(discount, offer.maxDiscount);
  }

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
