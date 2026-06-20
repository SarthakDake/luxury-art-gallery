"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, User } from "lucide-react";
import Link from "next/link";

export function AuthActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="icon-btn auth-actions-placeholder"
        aria-hidden="true"
      />
    );
  }

  if (session?.user) {
    return (
      <Link
        href="/profile"
        aria-label="My Profile/Orders"
        className="icon-btn"
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <Link href="/signin" aria-label="Sign in" className="icon-btn">
      <LogIn className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </Link>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "btn-secondary"}
    >
      Sign Out
    </button>
  );
}

export function MobileAuthActions({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    return (
      <>
        <li>
          <Link
            href="/profile"
            onClick={onNavigate}
            className="mobile-nav-link"
          >
            My Profile/Orders
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              signOut({ callbackUrl: "/" });
            }}
            className="mobile-nav-link w-full text-left"
          >
            Sign Out
          </button>
        </li>
      </>
    );
  }

  return (
    <li>
      <Link href="/signin" onClick={onNavigate} className="mobile-nav-link">
        Sign In
      </Link>
    </li>
  );
}

export function SignInButton({
  provider,
  label,
  callbackUrl = "/profile",
}: {
  provider: string;
  label: string;
  callbackUrl?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn(provider, { callbackUrl })}
      className="btn-primary w-full"
    >
      {label}
    </button>
  );
}
