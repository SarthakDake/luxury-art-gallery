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
          const blocked = new Set(ids);

          if (blocked.size === 0) {
            return state;
          }

          return {
            items: state.items.filter((cartItem) => !blocked.has(cartItem.id)),
          };
        }),

      reconcileWithCatalog: (artworks) => {
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
      name: "colors-n-joy-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

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
      const frame = requestAnimationFrame(() => setHydrated(true));
      return () => cancelAnimationFrame(frame);
    }

    return persistApi.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [isClient]);

  return isClient && hydrated;
}
