"use client";

import config from "@/data/config.json";
import { Reveal } from "@/components/motion/Reveal";
import { type CartItem, useCartStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice } from "@/types/artwork";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function buildCheckoutMessage(items: CartItem[], total: number): string {
  const lines = items.map((item) => {
    const priceLabel = formatPrice(item.price * item.quantity);
    const quantityLabel = item.quantity > 1 ? ` (x${item.quantity})` : "";

    return `${item.title} - ${item.selectedSize} - ${priceLabel}${quantityLabel}`;
  });

  return `Hello, I would like to acquire the following pieces: ${lines.join(", ")}. Total: ${formatPrice(total)}.`;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const finalTotal = subtotal;

  function handleCheckout() {
    if (items.length === 0) return;

    const message = buildCheckoutMessage(items, finalTotal);
    const encodedMessage = encodeURIComponent(message);

    if (config.whatsappNumber) {
      window.open(
        `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      window.open(
        `mailto:${config.contactEmail}?subject=${encodeURIComponent("Order Request")}&body=${encodedMessage}`,
        "_self",
      );
    }

    clearCart();
  }

  if (items.length === 0) {
    return (
      <div className="site-container page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Reveal variant="slide-up" className="flex flex-col items-center text-center">
          <p className="eyebrow">Your Cart</p>
          <h1 className="page-title mt-4">Your collection is currently empty.</h1>
          <p className="body-text mt-4 max-w-md">
            Discover works from the gallery and add pieces you wish to acquire.
          </p>
          <Link href="/shop" className="btn-primary btn-responsive mt-10">
            Return to Gallery
          </Link>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="mb-12 space-y-4">
        <h1 className="page-title">Your Cart</h1>
        <p className="body-text">
          Review your selected works before submitting an order request.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <Reveal as="section" variant="slide-up" aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="eyebrow mb-6">
            Selected Works
          </h2>

          <ul className="border-t border-[var(--border)]" data-reveal-stagger>
            {items.map((item) => (
              <li
                key={`${item.id}-${item.selectedSize}`}
                className="cart-item-row border-b border-[var(--border)] last:border-b-0"
                data-reveal="slide-up"
              >
                <Link
                  href={`/art/${item.slug}`}
                  scroll={false}
                  className="art-image-frame-sm block shrink-0"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="104px"
                    className="object-cover"
                  />
                </Link>

                <div className="cart-item-body">
                  <div className="cart-item-meta">
                    <Link
                      href={`/art/${item.slug}`}
                      scroll={false}
                      className="cart-item-title"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-[var(--muted)]">
                      {item.selectedSize}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-[var(--muted)]">
                        Qty {item.quantity}
                      </p>
                    )}
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="btn-text shrink-0 self-start sm:self-center"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="aside" variant="slide-left" className="card-panel sticky-below-header h-fit p-6 sm:p-8">
          <h2 className="eyebrow mb-8">Order Summary</h2>

          <dl className="space-y-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[var(--muted)]">Subtotal</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[var(--muted)]">Shipping</dt>
              <dd className="text-[var(--foreground)]">Free Shipping</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
              <dt className="text-base font-medium text-[var(--foreground)]">
                Final Total
              </dt>
              <dd className="text-base font-medium text-[var(--foreground)]">
                {formatPrice(finalTotal)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleCheckout}
            className="btn-primary btn-block mt-8"
          >
            Submit Order Request
          </button>
        </Reveal>
      </div>
    </div>
  );
}
