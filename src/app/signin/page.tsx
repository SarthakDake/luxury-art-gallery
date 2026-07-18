import { sanitizeCallbackUrl } from "@/lib/callback-url";
import { authOptions } from "@/lib/auth";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { SignInForm } from "./SignInForm";

function getProviderIds() {
  return authOptions.providers
    .map((provider) => provider.id)
    .filter((id): id is string => Boolean(id));
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);
  const providers = getProviderIds();

  return (
    <div className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Sign In" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="signin-intro">
        <p className="eyebrow">Welcome Back</p>
        <h1 className="page-title">Sign In</h1>
        <p className="body-text max-w-xl">
          Sign in to view your order history and track acquisitions from the
          shop.
        </p>
      </Reveal>

      <Reveal variant="fade-in" className="signin-card">
        <SignInForm providers={providers} callbackUrl={callbackUrl} />

        <p className="body-text mt-6 text-center">
          <Link href="/shop" className="underline underline-offset-4">
            Continue browsing without signing in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
