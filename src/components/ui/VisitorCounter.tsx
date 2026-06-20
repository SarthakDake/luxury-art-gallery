"use client";

import config from "@/data/config.json";
import { useIsClient } from "@/hooks/use-is-client";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

const SESSION_KEY = "colors-n-joy-visitor-counted";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function useCountUp(target: number, duration = 1200): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      const resetFrame = requestAnimationFrame(() => setDisplay(0));
      return () => cancelAnimationFrame(resetFrame);
    }

    let frame = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const isClient = useIsClient();
  const animatedCount = useCountUp(isClient && count !== null ? count : 0);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;

    async function trackVisit() {
      try {
        const hasCounted = sessionStorage.getItem(SESSION_KEY) === "1";

        if (!hasCounted) {
          const incrementResponse = await fetch("/api/visitors", {
            method: "POST",
          });

          if (incrementResponse.ok) {
            const data = (await incrementResponse.json()) as { count: number };
            sessionStorage.setItem(SESSION_KEY, "1");

            if (!cancelled) {
              setCount(data.count);
            }

            return;
          }
        }

        const response = await fetch("/api/visitors", { cache: "no-store" });

        if (!response.ok) return;

        const data = (await response.json()) as { count: number };

        if (!cancelled) {
          setCount(data.count);
        }
      } catch {
        if (!cancelled) {
          setCount(0);
        }
      }
    }

    trackVisit();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const label =
    count === 1
      ? config.visitorCounter.singularLabel
      : config.visitorCounter.pluralLabel;

  return (
    <p className="footer-visitor" aria-live="polite">
      <span className="footer-visitor-eyebrow">{config.visitorCounter.eyebrow}</span>
      <span className="footer-visitor-stat">
        <Eye className="footer-visitor-icon" strokeWidth={1.5} aria-hidden />
        <span className="footer-visitor-count">
          {!isClient || count === null ? "—" : formatCount(animatedCount)}
        </span>
        <span className="footer-visitor-label">{label}</span>
      </span>
    </p>
  );
}
