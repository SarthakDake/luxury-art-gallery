import { ContentStudio } from "@/components/admin/content/ContentStudio";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAdminSession } from "@/lib/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdminSession("/admin/content");

  return (
    <div className="site-container page-shell content-studio-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Content Studio" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="content-studio-intro">
        <p className="eyebrow">Artist Dashboard</p>
        <h1 className="page-title">Content Studio</h1>
        <p className="body-text max-w-2xl">
          A simple editor for your shop, site copy, and profile. Choose a section,
          fill in the details, and save when you are ready.
        </p>
        <div className="content-studio-links">
          <Link href="/admin/orders" className="btn-text">
            Order management
          </Link>
        </div>
      </Reveal>

      <Reveal variant="slide-up">
        <ContentStudio />
      </Reveal>
    </div>
  );
}
