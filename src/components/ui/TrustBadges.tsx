import config from "@/data/config.json";
import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const badgeIcons = [Truck, ShieldCheck, RotateCcw, Headphones, Sparkles];

interface TrustBadgesProps {
  variant?: "pills" | "list";
}

export function TrustBadges({ variant = "pills" }: TrustBadgesProps) {
  if (variant === "list") {
    return (
      <ul className="trust-list">
        {config.trustBadges.map((badge, index) => {
          const Icon = badgeIcons[index % badgeIcons.length];

          return (
            <li key={badge} className="trust-list-item">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {badge}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="trust-badges-row">
      {config.trustBadges.map((badge, index) => {
        const Icon = badgeIcons[index % badgeIcons.length];

        return (
          <li key={badge}>
            <span className="trust-badge-pill">
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {badge}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
