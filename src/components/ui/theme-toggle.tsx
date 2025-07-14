
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSafeThemeToggle } from "@/hooks/use-safe-theme-toggle";
import { Skeleton } from "./skeleton";

export function ThemeToggle() {
  const { actualTheme, toggleTheme, isReady } = useSafeThemeToggle();

  if (!isReady) {
    // Render a placeholder skeleton on the server and during initial client render
    // to avoid layout shift and hydration errors.
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-11" />
            <Skeleton className="h-5 w-5" />
        </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-5 w-5 text-foreground/60" />
      <Switch
        checked={actualTheme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="h-5 w-5 text-foreground/60" />
    </div>
  );
}
