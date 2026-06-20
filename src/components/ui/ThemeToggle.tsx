"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "icon-btn" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
    >
      <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
        {mounted ? (
          isDark ? (
            <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          ) : (
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
          )
        ) : (
          <Sun className="h-[18px] w-[18px] opacity-0" strokeWidth={1.5} />
        )}
      </span>
    </button>
  );
}
