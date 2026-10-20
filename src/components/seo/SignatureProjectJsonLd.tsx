import { getArtworkImageSrc } from "@/lib/artwork-image";
import { getSiteUrl } from "@/lib/auth-url";
import { resolvePlainDescription } from "@/lib/seo";
import type { SignatureProject } from "@/types/site-config";

export function SignatureProjectJsonLd({
  project,
  providerName,
}: {
  project: SignatureProject;
  providerName: string;
}) {
  const baseUrl = getSiteUrl();
  const pathname = `/signature-wall-art/${project.slug}`;
  const url = new URL(pathname, baseUrl).toString();
  const description = project.summary.trim()
    ? resolvePlainDescription(project.summary)
    : undefined;
  const image = project.coverImageUrl?.trim()
    ? new URL(getArtworkImageSrc(project.coverImageUrl), baseUrl).toString()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: description || undefined,
    url,
    ...(image ? { image } : {}),
    creator: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: providerName,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
