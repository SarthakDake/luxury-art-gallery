import type { ArtworkEditorStep } from "./ArtworkEditorShell";

export type StudioPreviewTarget =
  | {
      scope: "artwork";
      step: ArtworkEditorStep;
      label: string;
    }
  | {
      scope: "site";
      region:
        | "hero"
        | "announcements"
        | "product-copy"
        | "promotions"
        | "footer"
        | "theme"
        | "homepage"
        | "testimonials";
      label: string;
    }
  | {
      scope: "about";
      region: "identity" | "exhibitions" | "press";
      label: string;
    }
  | {
      scope: "signature";
      region: "page" | "projects" | "process" | "faq" | "inquiry" | "homepage";
      label: string;
    }
  | {
      scope: "trade";
      region:
        | "page"
        | "hero"
        | "whyPartner"
        | "benefits"
        | "process"
        | "pdf"
        | "inquiry"
        | "homepage";
      label: string;
    };

export const ARTWORK_STEP_PREVIEW_LABELS: Record<ArtworkEditorStep, string> = {
  details: "Artwork details on product page",
  photos: "Cover & photos on product page",
  pricing: "Sizes & prices on product page",
  videos: "Videos on product page",
  more: "Extra options on product page",
};
