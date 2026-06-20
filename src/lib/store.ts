import { create } from "zustand";

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
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
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

  clearCart: () => set({ items: [] }),
}));

export function selectCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
