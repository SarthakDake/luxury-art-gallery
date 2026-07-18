import { HomeSections } from "@/components/home/HomeSections";
import { getArtworks, getSiteConfig } from "@/lib/site-data";

/** ISR fallback (seconds). CMS saves trigger on-demand revalidation immediately. */
export const revalidate = 3600;

export default async function Home() {
  const [config, artworks] = await Promise.all([getSiteConfig(), getArtworks()]);

  return <HomeSections config={config} artworks={artworks} />;
}
