import { getContactEmails } from "@/lib/emails";
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
  const emails = getContactEmails();

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
