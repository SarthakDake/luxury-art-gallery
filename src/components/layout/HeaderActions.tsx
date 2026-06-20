"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { selectCartItemCount, useCartStore } from "@/lib/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function HeaderActions() {
  const items = useCartStore((state) => state.items);
  const itemCount = selectCartItemCount(items);

  return (
    <div className="flex items-center">
      <ThemeToggle className="icon-btn hidden sm:inline-flex" />

      <Link
        href="/cart"
        aria-label={`Cart, ${itemCount} items`}
        className="icon-btn relative"
      >
        <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center bg-[var(--foreground)] px-1 text-[10px] font-medium text-[var(--background)]">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}
