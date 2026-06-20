import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PageNavigationProvider } from "@/components/motion/PageNavigationProvider";
import { ScrollRevealProvider } from "@/components/motion/ScrollRevealProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Colors N Joy",
  description: "A collection of minimalist visual narratives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-[family-name:var(--font-sans)]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ScrollRevealProvider>
            <AnnouncementBar />
            <Header />
            <main className="main-content flex-1">
              <PageNavigationProvider>{children}</PageNavigationProvider>
            </main>
            <Footer />
          </ScrollRevealProvider>
        </ThemeProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
