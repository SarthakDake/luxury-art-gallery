import type { CSSProperties } from "react";
import type { SiteBrandTokens } from "@/types/site-config";

type BrandCssVars = CSSProperties & Record<`--${string}`, string>;

/**
 * Map CMS brand tokens onto CSS custom properties consumed by
 * `tokens.css` and the Tailwind `@theme` bridge.
 */
export function brandTokensToCssVars(brand: SiteBrandTokens): BrandCssVars {
  return {
    "--background": brand.background,
    "--foreground": brand.foreground,
    "--muted": brand.muted,
    "--border": brand.border,
    "--surface": brand.surface,
    "--surface-elevated": brand.background,
    "--accent": brand.accent,
    "--accent-foreground": brand.accentForeground,
    "--radius-sm": brand.radiusSm,
    "--radius-md": brand.radiusMd,
    "--radius-lg": brand.radiusLg,
    "--brand-dark-background": brand.darkBackground,
    "--brand-dark-foreground": brand.darkForeground,
    "--brand-dark-muted": brand.darkMuted,
    "--brand-dark-border": brand.darkBorder,
    "--brand-dark-surface": brand.darkSurface,
    "--brand-dark-accent": brand.darkAccent,
  };
}
