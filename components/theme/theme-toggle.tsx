"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={cn(
          "border-border/60 bg-background/70 relative h-10 w-10 overflow-hidden rounded-full border backdrop-blur",
        )}
        disabled
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      className={cn(
        "border-border/60 bg-background/70 relative h-10 w-10 overflow-hidden rounded-full border backdrop-blur",
      )}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          isDark ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute inset-0 m-auto h-5 w-5 transition-all",
          isDark ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
