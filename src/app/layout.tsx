import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ConditionalAnalytics } from "@/components/layout/ConditionalAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PageNavigationProvider } from "@/components/motion/PageNavigationProvider";
import { ScrollRevealProvider } from "@/components/motion/ScrollRevealProvider";
import { ArtworksProvider } from "@/components/providers/artworks-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { SiteConfigProvider } from "@/components/providers/site-config-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import { buildSiteMetadata } from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return buildSiteMetadata(config);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, artworks] = await Promise.all([getSiteConfig(), getArtworks()]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col font-[family-name:var(--font-sans)]"
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SessionProvider>
          <SiteConfigProvider config={config}>
            <ArtworksProvider artworks={artworks}>
              <ThemeProvider attribute="class" defaultTheme="light">
                <ScrollRevealProvider>
                  <AnnouncementBar config={config} />
                  <Header config={config} />
                  <main id="main-content" className="main-content flex-1">
                    <PageNavigationProvider>{children}</PageNavigationProvider>
                  </main>
                  <Footer config={config} />
                </ScrollRevealProvider>
              </ThemeProvider>
              <WhatsAppButton />
            </ArtworksProvider>
          </SiteConfigProvider>
        </SessionProvider>
        <ConditionalAnalytics />
      </body>
    </html>
  );
}
