
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  // Start with a default state, and update it on the client.
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsClient(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  React.useEffect(() => {
    if (!isClient) return; // Don't run this logic on the server or during the initial render.
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, isClient]);

  // Avoid rendering the switch until we know the correct client-side state
  if (!isClient) {
    return null; 
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-5 w-5 text-foreground/60" />
      <Switch
        checked={isDarkMode}
        onCheckedChange={setIsDarkMode}
        aria-label="Toggle theme"
      />
      <Moon className="h-5 w-5 text-foreground/60" />
    </div>
  );
}
