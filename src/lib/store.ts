import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useIsClient } from "@/hooks/use-is-client";
import { syncCartWithCatalog, type CartCatalogSyncResult } from "@/lib/cart-catalog-sync";
import type { Artwork } from "@/types/artwork";
import { useEffect, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  selectedSize: string;
  price: number;
  quantity: number;
}

type AddToCartInput = Omit<CartItem, "quantity"> & { quantity?: number };

interface CartStore {
  items: CartItem[];
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string, selectedSize: string) => void;
  removeItemsByArtworkIds: (ids: string[]) => void;
  reconcileWithCatalog: (artworks: Artwork[]) => CartCatalogSyncResult;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          // Line items are deduped by (artwork id + size): the same artwork in a
          // different size is a distinct cart line, but the same id+size just bumps quantity.
          const existing = state.items.find(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.selectedSize === item.selectedSize,
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id &&
                cartItem.selectedSize === item.selectedSize
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + (item.quantity ?? 1),
                    }
                  : cartItem,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          };
        }),

      removeFromCart: (id, selectedSize) =>
        set((state) => ({
          items: state.items.filter(
            (cartItem) =>
              !(cartItem.id === id && cartItem.selectedSize === selectedSize),
          ),
        })),

      removeItemsByArtworkIds: (ids) =>
        set((state) => {
          // Removes by artwork id alone (all sizes), unlike removeFromCart which
          // targets a single id+size line — used when an artwork is deleted/unpublished.
          const blocked = new Set(ids);

          if (blocked.size === 0) {
            return state;
          }

          return {
            items: state.items.filter((cartItem) => !blocked.has(cartItem.id)),
          };
        }),

      reconcileWithCatalog: (artworks) => {
        // Cart items are persisted independently of the live catalog, so titles,
        // prices, or images may drift or an item may be delisted; sync reconciles
        // stored items against the current catalog before checkout.
        const state = useCartStore.getState();
        const result = syncCartWithCatalog(state.items, artworks);

        if (result.changed) {
          set({ items: result.items });
        }

        return result;
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      // localStorage key; only `items` is persisted so store actions/methods
      // aren't serialized into storage.
      name: "colors-n-joy-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Total item count sums quantities across lines, not the number of distinct lines.
export function selectCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function useCartHydrated() {
  const isClient = useIsClient();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    const persistApi = useCartStore.persist;

    if (!persistApi || persistApi.hasHydrated()) {
      // Already hydrated (or no persist middleware) — defer a frame anyway so
      // the first client render still matches the server-rendered (empty) markup.
      const frame = requestAnimationFrame(() => setHydrated(true));
      return () => cancelAnimationFrame(frame);
    }

    return persistApi.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [isClient]);

  return isClient && hydrated;
}
