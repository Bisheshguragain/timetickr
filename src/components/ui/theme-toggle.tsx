
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSafeThemeToggle } from "@/hooks/use-safe-theme-toggle";

export function ThemeToggle() {
  const { actualTheme, toggleTheme, isReady } = useSafeThemeToggle();

  if (!isReady) {
    // Render a placeholder on the server and during initial client render
    // to avoid layout shift and hydration errors. This matches the default dark theme.
    return (
        <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <div className="h-6 w-11 rounded-full bg-input inline-flex items-center p-0.5">
                <div className="h-5 w-5 rounded-full bg-muted shadow-lg ring-0" />
            </div>
            <Moon className="h-5 w-5 text-muted-foreground" />
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
