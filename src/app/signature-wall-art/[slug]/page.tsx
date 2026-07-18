import { SignatureProjectView } from "@/components/signature/SignatureProjectView";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;

  return page.projects.items.map((project) => ({ slug: project.slug }));
}

interface SignatureProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SignatureProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;
  const project = page.projects.items.find((item) => item.slug === slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} | Signature Wall Art`,
    description: project.summary || page.intro.subtitle,
  };
}

export default async function SignatureProjectPage({
  params,
}: SignatureProjectPageProps) {
  const { slug } = await params;
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;
  const project = page.projects.items.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return <SignatureProjectView project={project} siteConfig={config} />;
}
