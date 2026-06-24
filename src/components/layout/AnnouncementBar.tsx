import type { SiteConfig } from "@/types/site-config";

export function AnnouncementBar({ config }: { config: SiteConfig }) {
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
