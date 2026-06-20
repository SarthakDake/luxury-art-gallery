"use client";

import { Minus, Plus } from "lucide-react";
import { selectCartItemCount, useCartStore } from "@/lib/store";

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantityStepperProps) {
  const cartCount = useCartStore((state) =>
    selectCartItemCount(state.items),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="field-label">Quantity</span>
        {cartCount > 0 && (
          <span className="text-xs text-[var(--muted)]">
            {cartCount} in cart
          </span>
        )}
      </div>

      <div className="quantity-stepper">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, quantity - 1))}
          disabled={quantity <= min}
          className="quantity-btn"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="quantity-value" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="quantity-btn"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
