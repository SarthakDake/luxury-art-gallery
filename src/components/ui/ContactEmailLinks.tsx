"use client";

import { useSiteConfig } from "@/components/providers/site-config-provider";
import { DEFAULT_CONTACT_EMAIL, parseEmailList } from "@/lib/email-list";
import { Mail } from "lucide-react";

export function ContactEmailLinks({
  className,
  linkClassName,
  iconClassName,
  showIcon = true,
  asItems = false,
}: {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  showIcon?: boolean;
  asItems?: boolean;
}) {
  const config = useSiteConfig();
  const emails =
    [
      ...new Set([
        ...parseEmailList(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
        ...parseEmailList(config.contactEmail),
      ]),
    ].length > 0
      ? [
          ...new Set([
            ...parseEmailList(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
            ...parseEmailList(config.contactEmail),
          ]),
        ]
      : [DEFAULT_CONTACT_EMAIL];

  const items = emails.map((email) => (
    <li key={email}>
      <a href={`mailto:${email}`} className={linkClassName}>
        {showIcon ? (
          <Mail className={iconClassName} strokeWidth={1.5} aria-hidden />
        ) : null}
        <span>{email}</span>
      </a>
    </li>
  ));

  if (asItems) {
    return items;
  }

  return <ul className={className}>{items}</ul>;
}
