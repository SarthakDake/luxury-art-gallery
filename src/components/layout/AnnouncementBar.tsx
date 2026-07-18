import type { PublicSiteConfig } from "@/lib/site-config";

export function AnnouncementBar({ config }: { config: PublicSiteConfig }) {
  return (
    <div className="announcement-bar">
      <div className="site-container announcement-bar-inner">
        <ul className="announcement-list">
          {config.announcements.map((announcement) => (
            <li key={announcement} className="announcement-item">
              {announcement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
