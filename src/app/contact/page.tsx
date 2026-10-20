import { ContactPageContent } from "./ContactPageContent";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return buildPageMetadata(config, "contact", "/contact", {
    title: "Contact us",
    description:
      "Reach the studio for acquisitions, commissions, and private viewings.",
  });
}

export default function ContactPage() {
  return <ContactPageContent />;
}
