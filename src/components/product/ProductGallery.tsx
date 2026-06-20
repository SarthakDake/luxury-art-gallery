"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLButtonElement>(null);

  const activeImage = images[activeIndex] ?? images[0];
  const hasMultiple = images.length > 1;

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }, [images.length]);

  const handleStageMouseMove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setZoomOrigin({
        x: Math.min(Math.max(x, 0), 100),
        y: Math.min(Math.max(y, 0), 100),
      });
    },
    [],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft" && hasMultiple) {
        showPrevious();
      }

      if (event.key === "ArrowRight" && hasMultiple) {
        showNext();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, hasMultiple, lightboxOpen, showNext, showPrevious]);

  return (
    <>
      <div className="product-gallery">
        <button
          ref={stageRef}
          type="button"
          className={`product-gallery-stage ${isZooming ? "product-gallery-stage--zooming" : ""}`}
          onClick={openLightbox}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleStageMouseMove}
          aria-label={`View ${title} — click to enlarge`}
        >
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="product-gallery-stage-image media-cover"
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          />

          <span className="product-gallery-zoom-hint">
            <ZoomIn className="product-gallery-zoom-icon" strokeWidth={1.5} />
            Click to enlarge
          </span>
        </button>

        {hasMultiple && (
          <div className="product-gallery-thumbs" role="tablist" aria-label="Product images">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                role="tab"
                onClick={() => setActiveIndex(index)}
                className={`product-gallery-thumb ${
                  activeIndex === index ? "product-gallery-thumb--active" : ""
                }`}
                aria-label={`View image ${index + 1}`}
                aria-selected={activeIndex === index}
              >
                <Image
                  src={src}
                  alt={`${title} — thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="media-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="product-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="product-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                className="product-lightbox-nav product-lightbox-nav--prev"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                className="product-lightbox-nav product-lightbox-nav--next"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            className="product-lightbox-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes="90vw"
              className="product-lightbox-image"
              priority
            />
          </div>

          {hasMultiple && (
            <p className="product-lightbox-counter">
              {activeIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
