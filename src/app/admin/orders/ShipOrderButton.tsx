"use client";

import { markOrderShipped } from "@/app/admin/orders/actions";
import { useState, useTransition } from "react";

export function ShipOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    startTransition(async () => {
      const result = await markOrderShipped(orderId);

      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="admin-ship-action">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn-secondary text-xs sm:text-sm"
      >
        {isPending ? "Updating…" : "Mark Shipped"}
      </button>
      {error ? (
        <p className="admin-ship-action-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
