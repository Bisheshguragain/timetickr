
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeThemeToggle } from "@/hooks/use-safe-theme-toggle";
import { Skeleton } from "./skeleton";

export default function ThemeToggleButton() {
  const { actualTheme, toggleTheme, isReady } = useSafeThemeToggle();

  if (!isReady) {
    // Render a placeholder skeleton to avoid hydration mismatch
    // and layout shift. This will be visible for a fraction of a second.
    return <Skeleton className="h-10 w-10" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
