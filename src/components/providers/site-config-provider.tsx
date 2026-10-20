"use client";

import { createContext, useContext } from "react";
import type { PublicSiteConfig } from "@/lib/site-config";

type SiteConfigContextValue = {
  config: PublicSiteConfig;
  /** Studio contact emails — injected from the server layout, not exposed on `/api/site/config`. */
  contactEmails: string[];
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({
  config,
  contactEmails,
  children,
}: {
  config: PublicSiteConfig;
  contactEmails: string[];
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={{ config, contactEmails }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): PublicSiteConfig {
  const value = useContext(SiteConfigContext);

  if (!value) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider.");
  }

  return value.config;
}

export function useContactEmails(): string[] {
  const value = useContext(SiteConfigContext);

  if (!value) {
    throw new Error("useContactEmails must be used within SiteConfigProvider.");
  }

  return value.contactEmails;
}
