"use client";

import { createContext, useContext } from "react";
import type { PublicSiteConfig } from "@/lib/site-config";

const SiteConfigContext = createContext<PublicSiteConfig | null>(null);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: PublicSiteConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): PublicSiteConfig {
  const config = useContext(SiteConfigContext);

  if (!config) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider.");
  }

  return config;
}
