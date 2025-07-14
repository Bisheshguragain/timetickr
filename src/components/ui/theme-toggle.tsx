
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSafeThemeToggle } from "@/hooks/use-safe-theme-toggle";
import { Skeleton } from "./skeleton";

export function ThemeToggle() {
  const { actualTheme, toggleTheme, isReady } = useSafeThemeToggle();

  if (!isReady) {
    // Render a placeholder skeleton to avoid hydration mismatch
    // and layout shift. This will be visible for a fraction of a second.
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {actualTheme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
