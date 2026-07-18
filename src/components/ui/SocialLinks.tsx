"use client";

import { useSiteConfig } from "@/components/providers/site-config-provider";
import type { SiteSocialLinks } from "@/types/site-config";
import Link from "next/link";

export type SocialPlatform =
  | "youtube"
  | "facebook"
  | "whatsapp"
  | "pinterest"
  | "instagram";

const platformOrder: SocialPlatform[] = [
  "youtube",
  "facebook",
  "whatsapp",
  "pinterest",
  "instagram",
];

const platformLabels: Record<SocialPlatform, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  pinterest: "Pinterest",
  instagram: "Instagram",
};

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.8-4.7 4.55-4.7 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.97.93-1.97 1.89v2.27h3.35l-.54 3.5h-2.81V24C19.62 23.1 24 18.1 24 12.07Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.09 3.16 9.44 7.63 11.17-.1-.95-.2-2.4.04-3.43.22-.94 1.4-6.01 1.4-6.01s-.36-.72-.36-1.78c0-1.67.97-2.91 2.17-2.91 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 3.99-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.26 3.78-5.52 0-2.89-2.08-4.91-5.05-4.91-3.44 0-5.46 2.58-5.46 5.25 0 1.04.4 2.16.9 2.77.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.44-2.89-2.44-4.65 0-3.79 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.24 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.86c-.27 1.04-1 2.35-1.49 3.15C9.57 23.81 10.76 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.64c-.78.3-1.44.7-2.1 1.36C1.38 2.66.98 3.32.68 4.1.38 4.86.17 5.74.11 7.01.01 8.29 0 8.7 0 12s.01 3.71.07 4.99c.06 1.27.27 2.15.57 2.91.3.78.7 1.44 1.36 2.1.66.66 1.32 1.06 2.1 1.36.76.3 1.64.51 2.91.57 1.28.06 1.69.07 4.99.07s3.71-.01 4.99-.07c1.27-.06 2.15-.27 2.91-.57.78-.3 1.44-.7 2.1-1.36.66-.66 1.06-1.32 1.36-2.1.3-.76.51-1.64.57-2.91.06-1.28.07-1.69.07-4.99s-.01-3.71-.07-4.99c-.06-1.27-.27-2.15-.57-2.91-.3-.78-.7-1.44-1.36-2.1C21.34 1.38 20.68.98 19.9.68 19.14.38 18.26.17 16.99.11 15.71.01 15.3 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
        </svg>
      );
  }
}

function getSocialHref(
  platform: SocialPlatform,
  links: SiteSocialLinks,
  whatsappNumber: string,
): string | null {
  if (platform === "whatsapp") {
    if (links.whatsapp) return links.whatsapp;
    const digits = whatsappNumber.replace(/\D/g, "");
    if (digits) {
      return `https://wa.me/${digits}`;
    }
    return null;
  }

  return links[platform] ?? null;
}

interface SocialLinksProps {
  showHeading?: boolean;
}

export function SocialLinks({ showHeading = true }: SocialLinksProps) {
  const config = useSiteConfig();
  const items = platformOrder
    .map((platform) => ({
      platform,
      href: getSocialHref(platform, config.socialLinks, config.whatsappNumber),
      label: platformLabels[platform],
    }))
    .filter((item) => Boolean(item.href));

  if (items.length === 0) return null;

  return (
    <div className="social-links-block">
      {showHeading && (
        <p className="social-links-heading">Discover more on our socials</p>
      )}
      <ul className="social-icons-row">
        {items.map(({ platform, href, label }) => (
          <li key={platform}>
            <Link
              href={href!}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label={label}
            >
              <SocialIcon platform={platform} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
