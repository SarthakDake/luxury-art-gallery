"use client";

import { useSiteConfig } from "@/components/providers/site-config-provider";
import { CartPromoCode } from "@/components/cart/CartPromoCode";
import { Reveal } from "@/components/motion/Reveal";
import { applyPromoCode } from "@/lib/promo-codes";
import { useCartHydrated, useCartStore } from "@/lib/store";
import {
  buildWhatsAppCheckoutUrl,
  isWhatsAppCheckoutAvailable,
} from "@/lib/whatsapp-checkout";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { formatPrice, getShowcaseArtworkIds, type Artwork } from "@/types/artwork";
import type { RazorpaySuccessResponse } from "@/types/razorpay";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useMemo, useState } from "react";

type PaymentGateway = "razorpay" | "phonepe" | null;

interface RazorpayCheckoutResponse {
  provider: "razorpay";
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

interface PhonePeCheckoutResponse {
  provider: "phonepe";
  orderId: string;
  redirectUrl: string;
  amount: number;
  currency: string;
}

type CheckoutResponse = RazorpayCheckoutResponse | PhonePeCheckoutResponse;

function CartPageContent() {
  const config = useSiteConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const removeItemsByArtworkIds = useCartStore((state) => state.removeItemsByArtworkIds);
  const clearCart = useCartStore((state) => state.clearCart);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworksLoaded, setArtworksLoaded] = useState(false);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>(null);
  const [gatewayLoading, setGatewayLoading] = useState(true);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [whatsAppCheckoutComplete, setWhatsAppCheckoutComplete] = useState(false);

  const showcaseArtworkIds = useMemo(
    () => getShowcaseArtworkIds(artworks),
    [artworks],
  );

  const purchasableItems = useMemo(
    () => items.filter((item) => !showcaseArtworkIds.has(item.id)),
    [items, showcaseArtworkIds],
  );

  const paymentStatus = searchParams.get("payment");
  const paymentOrderId = searchParams.get("orderId");
  const paymentSucceeded = checkoutSuccess;

  const subtotal = purchasableItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const appliedPromo = useMemo(() => {
    if (!appliedPromoCode) {
      return null;
    }

    const result = applyPromoCode(appliedPromoCode, subtotal, config);
    return result.valid ? result : null;
  }, [appliedPromoCode, config, subtotal]);
  const discount = appliedPromo?.discount ?? 0;
  const finalTotal = Math.max(subtotal - discount, 0);
  const isSessionLoading = status === "loading";
  const usesRazorpay = paymentGateway === "razorpay";
  const paymentConfigured = Boolean(paymentGateway);
  const whatsAppCheckoutAvailable = isWhatsAppCheckoutAvailable(config);
  const usesWhatsAppCheckout =
    !paymentConfigured && whatsAppCheckoutAvailable;
  const canCheckout =
    !isCheckingOut &&
    !gatewayLoading &&
    (usesWhatsAppCheckout ||
      (!isSessionLoading &&
        paymentConfigured &&
        status === "authenticated" &&
        (!usesRazorpay || razorpayReady)));

  useEffect(() => {
    async function loadArtworks() {
      try {
        const response = await fetch("/api/site/artworks");
        const payload = (await response.json()) as { artworks?: Artwork[] };

        if (payload.artworks) {
          setArtworks(payload.artworks);
        }
      } catch {
        setArtworks([]);
      } finally {
        setArtworksLoaded(true);
      }
    }

    void loadArtworks();
  }, []);

  useEffect(() => {
    if (!hydrated || artworks.length === 0) {
      return;
    }

    const showcaseIds = [...getShowcaseArtworkIds(artworks)];

    if (showcaseIds.length > 0) {
      removeItemsByArtworkIds(showcaseIds);
    }
  }, [artworks, hydrated, removeItemsByArtworkIds]);

  useEffect(() => {
    async function loadGateway() {
      try {
        const response = await fetch("/api/checkout");
        const data = (await response.json()) as { gateway: PaymentGateway };
        setPaymentGateway(data.gateway);
      } catch {
        setPaymentGateway(null);
      } finally {
        setGatewayLoading(false);
      }
    }

    loadGateway();
  }, []);

  useEffect(() => {
    if (paymentStatus !== "success") {
      if (paymentStatus === "failed") {
        const frame = requestAnimationFrame(() => {
          setCheckoutError("Payment was not completed. Please try again.");
          router.replace("/cart", { scroll: false });
        });
        return () => cancelAnimationFrame(frame);
      }

      return;
    }

    if (!paymentOrderId) {
      const frame = requestAnimationFrame(() => {
        setCheckoutError("Payment confirmation is invalid. Please contact support.");
        router.replace("/cart", { scroll: false });
      });
      return () => cancelAnimationFrame(frame);
    }

    const verifiedOrderId = paymentOrderId;
    let cancelled = false;

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/orders/payment-status?orderId=${encodeURIComponent(verifiedOrderId)}`,
        );
        const data = (await response.json()) as {
          verified?: boolean;
          error?: string;
        };

        if (cancelled) {
          return;
        }

        if (response.ok && data.verified) {
          clearCart();
          setAppliedPromoCode(null);
          setCheckoutSuccess(true);
          router.replace("/cart", { scroll: false });
          return;
        }

        setCheckoutError(
          data.error ?? "Payment could not be verified. Please contact support.",
        );
        router.replace("/cart", { scroll: false });
      } catch {
        if (!cancelled) {
          setCheckoutError("Payment could not be verified. Please try again.");
          router.replace("/cart", { scroll: false });
        }
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [paymentStatus, paymentOrderId, clearCart, router]);

  async function verifyRazorpayPayment(
    orderId: string,
    response: RazorpaySuccessResponse,
  ) {
    const verifyResponse = await fetch("/api/verifyOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    const verifyData = (await verifyResponse.json()) as {
      success?: boolean;
      error?: string;
    };

    if (!verifyResponse.ok || !verifyData.success) {
      throw new Error(verifyData.error ?? "Payment verification failed.");
    }
  }

  function openWhatsAppCheckout(url: string) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function redirectToWhatsAppCheckout() {
    const url = buildWhatsAppCheckoutUrl(purchasableItems, subtotal, config, {
      discount,
      promoCode: appliedPromo?.code,
      finalTotal,
    });

    if (!url) {
      setCheckoutError("Checkout is unavailable. Please try again later.");
      setIsCheckingOut(false);
      return false;
    }

    openWhatsAppCheckout(url);
    clearCart();
    setAppliedPromoCode(null);
    setWhatsAppCheckoutComplete(true);
    setIsCheckingOut(false);
    return true;
  }

  async function handleCheckout() {
    if (purchasableItems.length === 0 || isCheckingOut) return;

    if (!usesWhatsAppCheckout && isSessionLoading) return;

    if (usesWhatsAppCheckout) {
      setIsCheckingOut(true);
      setCheckoutError(null);
      redirectToWhatsAppCheckout();
      return;
    }

    if (status !== "authenticated") {
      router.push("/signin?callbackUrl=/cart");
      return;
    }

    if (!paymentConfigured) {
      if (whatsAppCheckoutAvailable) {
        setIsCheckingOut(true);
        setCheckoutError(null);
        redirectToWhatsAppCheckout();
        return;
      }

      setCheckoutError("Payment is not configured. Please try again later.");
      return;
    }

    if (usesRazorpay) {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey || !window.Razorpay) {
        setCheckoutError("Payment gateway is still loading. Please try again.");
        return;
      }
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: purchasableItems.map((item) => ({
            id: item.id,
            selectedSize: item.selectedSize,
            price: item.price,
            quantity: item.quantity,
          })),
          promoCode: appliedPromo?.code,
        }),
      });

      const checkoutData = (await checkoutResponse.json()) as CheckoutResponse & {
        error?: string;
      };

      if (!checkoutResponse.ok) {
        if (whatsAppCheckoutAvailable) {
          redirectToWhatsAppCheckout();
          return;
        }

        throw new Error(checkoutData.error ?? "Unable to start checkout.");
      }

      if (checkoutData.provider === "phonepe") {
        globalThis.location.assign(checkoutData.redirectUrl);
        return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey || !window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const payment = new window.Razorpay({
        key: razorpayKey,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: config.siteName,
        description: "Artwork purchase",
        order_id: checkoutData.razorpayOrderId,
        prefill: {
          name: session?.user?.name ?? undefined,
          email: session?.user?.email ?? undefined,
        },
        theme: {
          color: "#171717",
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment(checkoutData.orderId, response);
            clearCart();
            setAppliedPromoCode(null);
            setCheckoutSuccess(true);
          } catch (error) {
            setCheckoutError(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setIsCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
          },
        },
      });

      payment.open();
    } catch (error) {
      if (whatsAppCheckoutAvailable) {
        redirectToWhatsAppCheckout();
        return;
      }

      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
      setIsCheckingOut(false);
    }
  }

  if (paymentSucceeded) {
    return (
      <div className="site-container page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Reveal variant="slide-up" className="flex flex-col items-center text-center">
          <p className="eyebrow">Payment Successful</p>
          <h1 className="page-title mt-4">Thank you for your acquisition.</h1>
          <p className="body-text mt-4 max-w-md">
            Your payment was confirmed. You can review your order history anytime
            from your profile.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/profile" className="btn-primary btn-responsive">
              View My Orders
            </Link>
            <Link href="/shop" className="btn-secondary btn-responsive">
              Continue Browsing
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  if (whatsAppCheckoutComplete) {
    return (
      <div className="site-container page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Reveal variant="slide-up" className="flex flex-col items-center text-center">
          <p className="eyebrow">Order Sent</p>
          <h1 className="page-title mt-4">Your inquiry is on WhatsApp.</h1>
          <p className="body-text mt-4 max-w-md">
            We opened WhatsApp with your order details in a new tab. Your cart
            has been cleared here. Our studio will confirm your order on WhatsApp.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn-primary btn-responsive">
              Continue Browsing
            </Link>
            <Link href="/contact" className="btn-secondary btn-responsive">
              Contact Studio
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  if (!hydrated || (items.length > 0 && !artworksLoaded)) {
    return (
      <div className="site-container page-shell">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />
        <div className="cart-loading">
          <p className="eyebrow">Your Cart</p>
          <p className="body-text mt-4">Loading your selection…</p>
        </div>
      </div>
    );
  }

  if (purchasableItems.length === 0) {
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
    <>
      {usesRazorpay ? (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          onLoad={() => setRazorpayReady(true)}
        />
      ) : null}

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
            Review your selected works before completing secure checkout.
          </p>
        </Reveal>

        <div className="cart-layout">
          <Reveal as="section" variant="slide-up" aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="eyebrow mb-6">
              Selected Works
            </h2>

            <ul className="border-t border-[var(--border)]" data-reveal-stagger>
              {purchasableItems.map((item) => (
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
                    <ArtworkImage
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
                      disabled={isCheckingOut}
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
            <h2 className="eyebrow mb-6">Order Summary</h2>

            <CartPromoCode
              subtotal={subtotal}
              appliedPromo={appliedPromo}
              onApply={(promo) => setAppliedPromoCode(promo?.code ?? null)}
              disabled={isCheckingOut}
            />

            <dl className="cart-summary-list">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              {discount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[var(--muted)]">
                    Promo{appliedPromo ? ` (${appliedPromo.code})` : ""}
                  </dt>
                  <dd className="font-medium text-emerald-700 dark:text-emerald-400">
                    -{formatPrice(discount)}
                  </dd>
                </div>
              ) : null}
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

            {paymentConfigured ? (
              <p className="body-text mt-6 text-sm text-[var(--muted)]">
                Secure checkout via{" "}
                {usesRazorpay ? "Razorpay" : "PhonePe"}.
              </p>
            ) : null}

            {checkoutError ? (
              <p className="body-text mt-6 text-sm text-red-600 dark:text-red-400">
                {checkoutError}
              </p>
            ) : null}

            {status === "unauthenticated" && !isSessionLoading && paymentConfigured ? (
              <p className="body-text mt-6 text-sm">
                <Link href="/signin?callbackUrl=/cart" className="underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to complete checkout.
              </p>
            ) : null}

            {!paymentConfigured && !gatewayLoading && !whatsAppCheckoutAvailable ? (
              <p className="body-text mt-6 text-sm text-[var(--muted)]">
                Add Razorpay or PhonePe credentials to your environment to enable
                payments.
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!canCheckout}
              className="btn-primary btn-block mt-8"
            >
              {(!usesWhatsAppCheckout && isSessionLoading) || gatewayLoading
                ? "Checking Account…"
                : isCheckingOut
                  ? "Processing…"
                  : usesRazorpay && !razorpayReady
                    ? "Loading Checkout…"
                    : status !== "authenticated" && paymentConfigured
                      ? "Sign In to Checkout"
                      : "Checkout"}
            </button>
          </Reveal>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="site-container page-shell">
          <div className="cart-loading">
            <p className="eyebrow">Your Cart</p>
            <p className="body-text mt-4">Loading checkout…</p>
          </div>
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}
