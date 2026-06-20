"use client";

import { SignInButton } from "@/components/layout/AuthActions";

export function SignInForm({
  providers,
  callbackUrl,
}: {
  providers: string[];
  callbackUrl: string;
}) {
  if (providers.length === 0) {
    return (
      <p className="body-text">
        Authentication providers are not configured yet. Add{" "}
        <code className="text-sm">GOOGLE_CLIENT_ID</code>,{" "}
        <code className="text-sm">GOOGLE_CLIENT_SECRET</code>, and{" "}
        <code className="text-sm">NEXTAUTH_SECRET</code> to your environment.
      </p>
    );
  }

  return (
    <div className="signin-actions">
      {providers.includes("google") ? (
        <SignInButton
          provider="google"
          label="Continue with Google"
          callbackUrl={callbackUrl}
        />
      ) : null}

      {providers.includes("email") ? (
        <SignInButton
          provider="email"
          label="Continue with Email"
          callbackUrl={callbackUrl}
        />
      ) : null}
    </div>
  );
}
