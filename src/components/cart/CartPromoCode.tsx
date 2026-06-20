"use client";

import type { PromoApplication } from "@/lib/promo-codes";
import { formatPrice } from "@/types/artwork";
import { Check, Tag, X } from "lucide-react";
import { useState } from "react";

interface CartPromoCodeProps {
  subtotal: number;
  appliedPromo: PromoApplication | null;
  onApply: (promo: PromoApplication | null) => void;
  disabled?: boolean;
}

export function CartPromoCode({
  subtotal,
  appliedPromo,
  onApply,
  disabled = false,
}: CartPromoCodeProps) {
  const [code, setCode] = useState(appliedPromo?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || isApplying) {
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = (await response.json()) as PromoApplication & {
        message?: string;
        valid?: boolean;
      };

      if (!response.ok || !data.valid) {
        onApply(null);
        setError(data.message ?? "This promo code could not be applied.");
        return;
      }

      onApply(data);
      setCode(data.code);
    } catch {
      setError("Unable to validate promo code. Please try again.");
    } finally {
      setIsApplying(false);
    }
  }

  function handleRemove() {
    setCode("");
    setError(null);
    onApply(null);
  }

  return (
    <section className="cart-promo" aria-labelledby="cart-promo-heading">
      <div className="cart-promo-header">
        <Tag className="cart-promo-icon" strokeWidth={1.5} aria-hidden />
        <h3 id="cart-promo-heading" className="cart-promo-title">
          Promo Code
        </h3>
      </div>

      {appliedPromo ? (
        <div className="cart-promo-applied">
          <div className="cart-promo-applied-copy">
            <span className="cart-promo-applied-badge" aria-hidden>
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="cart-promo-applied-code">{appliedPromo.code}</p>
              <p className="cart-promo-applied-detail">
                {appliedPromo.headline}
              </p>
              <p className="cart-promo-applied-savings">
                You save {formatPrice(appliedPromo.discount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cart-promo-remove"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove promo code"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <form className="cart-promo-form" onSubmit={handleApply}>
          <div className="cart-promo-field">
            <label htmlFor="cart-promo-code" className="field-label">
              Enter code
            </label>
            <input
              id="cart-promo-code"
              type="text"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError(null);
              }}
              className="input-field cart-promo-input"
              placeholder="e.g. CNJ5"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled || isApplying}
            />
          </div>
          <button
            type="submit"
            className="btn-secondary cart-promo-apply"
            disabled={disabled || isApplying || code.trim().length === 0}
          >
            {isApplying ? "Applying…" : "Apply"}
          </button>
        </form>
      )}

      {error ? (
        <p className="cart-promo-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
