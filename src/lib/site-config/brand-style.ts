import type { CSSProperties } from "react";
import type { SiteBrandTokens } from "@/types/site-config";

type BrandCssVars = CSSProperties & Record<`--${string}`, string>;

/**
 * Map CMS brand tokens onto source CSS variables.
 *
 * Important: do NOT set `--background` / `--foreground` etc. inline on `<html>`.
 * Those semantic tokens must stay overridable by the `.dark` class from
 * next-themes. Inline styles would win and break light/dark toggling.
 */
export function brandTokensToCssVars(brand: SiteBrandTokens): BrandCssVars {
  return {
    "--brand-background": brand.background,
    "--brand-foreground": brand.foreground,
    "--brand-muted": brand.muted,
    "--brand-border": brand.border,
    "--brand-surface": brand.surface,
    "--brand-accent": brand.accent,
    "--brand-accent-foreground": brand.accentForeground,
    "--brand-dark-background": brand.darkBackground,
    "--brand-dark-foreground": brand.darkForeground,
    "--brand-dark-muted": brand.darkMuted,
    "--brand-dark-border": brand.darkBorder,
    "--brand-dark-surface": brand.darkSurface,
    "--brand-dark-accent": brand.darkAccent,
    "--radius-sm": brand.radiusSm,
    "--radius-md": brand.radiusMd,
    "--radius-lg": brand.radiusLg,
  };
}
