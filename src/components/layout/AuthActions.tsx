"use client";

import { useMounted } from "@/hooks/use-mounted";
import { isLocalAdminBypassEnabled } from "@/lib/local-admin-bypass";
import { signIn, signOut, useSession } from "next-auth/react";
import { FilePenLine, LayoutDashboard, LogIn, User } from "lucide-react";
import Link from "next/link";

function AuthActionsPlaceholder() {
  return (
    <span
      className="icon-btn auth-actions-placeholder"
      aria-hidden="true"
    />
  );
}

function canShowContentStudio(role: string | undefined) {
  return role === "ADMIN" || isLocalAdminBypassEnabled();
}

export function AuthActions() {
  const mounted = useMounted();
  const { data: session, status } = useSession();
  const showStudio = canShowContentStudio(session?.user?.role);

  if (!mounted || status === "loading") {
    return <AuthActionsPlaceholder />;
  }

  if (session?.user) {
    return (
      <div className="header-auth-actions">
        {showStudio ? (
          <>
            <Link
              href="/admin/content"
              aria-label="Content studio"
              className="icon-btn"
            >
              <FilePenLine className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/admin/orders"
              aria-label="Admin orders"
              className="icon-btn"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
          </>
        ) : null}
        <Link
          href="/profile"
          aria-label="My Profile/Orders"
          className="icon-btn"
        >
          <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  if (showStudio) {
    return (
      <div className="header-auth-actions">
        <Link
          href="/admin/content"
          aria-label="Content studio"
          className="icon-btn"
        >
          <FilePenLine className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
        <Link href="/signin" aria-label="Sign in" className="icon-btn">
          <LogIn className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
      </div>
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
  const mounted = useMounted();
  const { data: session, status } = useSession();
  const showStudio = canShowContentStudio(session?.user?.role);

  if (!mounted || status === "loading") {
    return null;
  }

  if (session?.user) {
    return (
      <>
        {showStudio ? (
          <>
            <li>
              <Link
                href="/admin/content"
                onClick={onNavigate}
                className="mobile-nav-link"
              >
                Content Studio
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                onClick={onNavigate}
                className="mobile-nav-link"
              >
                Admin Orders
              </Link>
            </li>
          </>
        ) : null}
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
    <>
      {showStudio ? (
        <li>
          <Link
            href="/admin/content"
            onClick={onNavigate}
            className="mobile-nav-link"
          >
            Content Studio
          </Link>
        </li>
      ) : null}
      <li>
        <Link href="/signin" onClick={onNavigate} className="mobile-nav-link">
          Sign In
        </Link>
      </li>
    </>
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
