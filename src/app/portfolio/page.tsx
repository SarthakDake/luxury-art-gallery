import { permanentRedirect } from "next/navigation";

/** Legacy Portfolio URL — renamed to For Interior Designers. */
export default function PortfolioRedirectPage() {
  permanentRedirect("/for-interior-designers");
}
