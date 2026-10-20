import { getSiteUrl } from "@/lib/auth-url";

export function ServicePageJsonLd({
  name,
  description,
  pathname,
  serviceType,
  providerName,
}: {
  name: string;
  description: string;
  pathname: string;
  serviceType: string;
  providerName: string;
}) {
  const baseUrl = getSiteUrl();
  const url = new URL(pathname, baseUrl).toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url,
    provider: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: providerName,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
