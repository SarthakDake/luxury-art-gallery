import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildRouteMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return buildRouteMetadata(config, "/return-policy", {
    title: "Return & refund policy",
    description:
      "Return, refund, and shipping terms for Colors N Joy shop orders — including damaged deliveries and satisfaction returns.",
    keywords: "return policy, refund policy, Colors N Joy shop",
  });
}

const policySections = [
  {
    title: "Overview",
    paragraphs: [
      "Colors N Joy creates original, handcrafted artworks. Each piece may show natural variation in texture, tone, and finish — these qualities are part of the work.",
      "This policy applies to purchases made through our online shop. Commission and signature projects may follow separate agreements discussed with the studio.",
    ],
  },
  {
    title: "Damaged or incorrect orders",
    paragraphs: [
      "If your order arrives damaged or incorrect, contact us within 48 hours of delivery with your order details and clear photos of the artwork and packaging.",
      "We will review eligible cases and offer a repair, replacement, or refund as appropriate. Items that are broken or damaged after delivery due to mishandling, improper installation, or use are not eligible for return or refund under this section.",
    ],
  },
  {
    title: "Returns when you are not satisfied with quality, design, or build",
    paragraphs: [
      "If you are not satisfied with the quality, design, or construction of a piece, contact us before sending anything back. Returns are considered on a case-by-case basis and must be approved in writing by the studio.",
      "When a return is approved, the artwork must be unused, in its original condition, and packed securely in the original packaging where possible.",
      "All costs of return shipping, insurance, and any redelivery or replacement shipping are paid by the customer unless we have confirmed otherwise in writing.",
    ],
  },
  {
    title: "Items not eligible for return",
    paragraphs: [
      "Broken, altered, or damaged items after delivery (including damage from hanging, storage, or transport arranged by the customer).",
      "Custom-made or made-to-order pieces unless there is a confirmed studio defect or an error on our part.",
      "Items returned without prior approval or not received in resalable condition.",
    ],
  },
  {
    title: "Refunds",
    paragraphs: [
      "Approved refunds are processed to the original payment method after we receive and inspect the returned artwork. Processing times depend on your bank or payment provider.",
      "Original outbound shipping charges are non-refundable unless the return is due to our error or a confirmed defect on arrival.",
    ],
  },
  {
    title: "How to contact us",
    paragraphs: [
      "For return requests, damage reports, or questions about this policy, reach the studio through our contact page. Include your order number, delivery date, and photos where relevant.",
    ],
  },
] as const;

export default async function ReturnPolicyPage() {
  const config = await getSiteConfig();

  return (
    <div className="site-container page-shell page-section-end">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Return policy" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="policy-page-intro">
        <p className="eyebrow">Shop</p>
        <h1 className="page-title">Return &amp; refund policy</h1>
        <p className="body-text max-w-2xl">
          Clear terms for shop orders — including damaged deliveries, satisfaction
          returns, and shipping costs. Last updated for {config.siteName.split("|")[0]?.trim() ?? "Colors N Joy"} online store.
        </p>
      </Reveal>

      <div className="policy-page-sections" data-reveal-stagger>
        {policySections.map((section) => (
          <Reveal
            key={section.title}
            as="section"
            variant="slide-up"
            className="card-panel policy-page-section"
          >
            <h2 className="section-title policy-page-section-title">{section.title}</h2>
            <div className="policy-page-section-body">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="body-text">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal variant="slide-up" className="policy-page-actions">
          <Link href="/contact" className="btn-primary">
            Contact the studio
          </Link>
          <Link href="/shop" className="btn-secondary">
            Back to shop
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
