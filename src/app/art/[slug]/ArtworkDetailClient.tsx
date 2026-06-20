"use client";

import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { ProductVideos } from "@/components/product/ProductVideos";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SizeSelector } from "@/components/product/SizeSelector";
import { useCartStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TrustBadges } from "@/components/ui/TrustBadges";
import type { SiteConfig } from "@/types/site-config";
import {
  formatPrice,
  getGalleryImages,
  type Artwork,
} from "@/types/artwork";
import { Check, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ArtworkDetailClientProps {
  artwork: Artwork;
  artworks: Artwork[];
  siteConfig: SiteConfig;
}

export function ArtworkDetailClient({
  artwork,
  artworks,
  siteConfig,
}: ArtworkDetailClientProps) {
  const whatsappMessage = "Hello, I have a question about this artwork.";
  const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <ArtworkDetailContent
      artwork={artwork}
      artworks={artworks}
      siteConfig={siteConfig}
      whatsappHref={whatsappHref}
    />
  );
}

function ArtworkDetailContent({
  artwork,
  artworks,
  siteConfig,
  whatsappHref,
}: {
  artwork: Artwork;
  artworks: Artwork[];
  siteConfig: SiteConfig;
  whatsappHref: string;
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(
    artwork.defaultSelectedSizeIndex ?? 0,
  );
  const [quantity, setQuantity] = useState(1);
  const [itemAdded, setItemAdded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const selectedSize = artwork.sizes[selectedSizeIndex] ?? artwork.sizes[0];
  const galleryImages = getGalleryImages(artwork);
  const dispatchNote = artwork.dispatchNote ?? siteConfig.defaultDispatchNote;
  const careGuide = artwork.careGuide ?? siteConfig.defaultCareGuide;
  const shippingReturns =
    artwork.shippingReturns ?? siteConfig.defaultShippingReturns;
  const beforeYouBuy = artwork.beforeYouBuy ?? siteConfig.defaultBeforeYouBuy;

  const dimensionsLine = artwork.sizes.map((size) => size.size).join(", ");

  const accordionItems = [
    {
      id: "description",
      title: "Description & Details",
      content: `${artwork.description}\n\nCategory: ${artwork.category}\nSubcategory: ${artwork.subcategory}\nDimensions: ${dimensionsLine}\nMaterial: ${artwork.material}\n\nPackage Content: ${artwork.title}`,
    },
    {
      id: "care",
      title: "Care Guide",
      content: careGuide,
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: shippingReturns,
    },
    {
      id: "before",
      title: "Before You Buy",
      content: beforeYouBuy,
    },
  ];

  function handleAddToCart() {
    if (!artwork.inStock) return;

    addToCart({
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug,
      imageUrl: artwork.imageUrl,
      selectedSize: selectedSize.size,
      price: selectedSize.price,
      quantity,
    });

    setItemAdded(true);
    window.setTimeout(() => setItemAdded(false), 2500);
  }

  async function handleCopyLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <>
      <div>
        <div className="site-container pt-8 lg:pt-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Gallery", href: "/shop" },
              { label: artwork.title },
            ]}
          />
        </div>

        <div className="site-container product-detail-body pt-6 lg:pt-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="sticky-below-header w-full">
              <ProductGallery images={galleryImages} title={artwork.title} />
            </div>

            <div
              className="product-details-column flex w-full flex-col gap-8 lg:gap-10"
              data-reveal="slide-up"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="eyebrow">
                    {artwork.category} | {artwork.subcategory}
                  </p>
                  {!artwork.inStock && (
                    <span className="stock-badge stock-badge-sold">
                      Sold Out
                    </span>
                  )}
                </div>

                <h1 className="page-title">{artwork.title}</h1>

                <p className="product-price">
                  {formatPrice(selectedSize.price)}
                </p>

                <p className="body-text">{artwork.material}</p>
              </div>

              <SizeSelector
                sizes={artwork.sizes}
                selectedIndex={selectedSizeIndex}
                onSelect={setSelectedSizeIndex}
              />

              <QuantityStepper quantity={quantity} onChange={setQuantity} />

              <p className="dispatch-note">{dispatchNote}</p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!artwork.inStock}
                  className="btn-primary btn-block"
                >
                  Add to Cart
                </button>

                <div
                  aria-live="polite"
                  className={`flex min-h-6 items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground)] transition-all duration-500 ${
                    itemAdded
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-1 opacity-0"
                  }`}
                >
                  <Check className="h-4 w-4" strokeWidth={1.5} />
                  Item Added
                </div>
              </div>

              <TrustBadges variant="list" />

              <div>
                <h2 className="section-title mb-4">Best Offers</h2>
                <div className="offer-panel">
                  {siteConfig.offers.map((offer) => (
                    <div key={offer.code} className="offer-item">
                      <p className="text-sm text-[var(--foreground)]">
                        {offer.headline}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Use Code:{" "}
                        <span className="offer-code">{offer.code}</span> (
                        {offer.detail})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="share-row">
                <p className="body-text">
                  Have a question about this product?{" "}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                    Chat with us
                  </a>
                </p>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-ghost"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" strokeWidth={1.5} />
                      Share
                    </>
                  )}
                </button>
              </div>

              <ProductAccordion
                items={accordionItems}
                defaultOpenId="description"
              />
            </div>
          </div>
        </div>

        <ProductFeatures />

        <ProductVideos artwork={artwork} />

        <RelatedProducts artworks={artworks} currentSlug={artwork.slug} />
      </div>
    </>
  );
}

export function ArtworkNotFound() {
  return (
    <div className="site-container page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Work unavailable</p>
      <h1 className="page-title mt-4">Product Not Found</h1>
      <p className="body-text mt-4 max-w-md">
        The piece you are looking for may have been moved or is no longer part of
        the collection.
      </p>
      <Link href="/shop" className="btn-primary btn-responsive mt-10">
        Return to Gallery
      </Link>
    </div>
  );
}
