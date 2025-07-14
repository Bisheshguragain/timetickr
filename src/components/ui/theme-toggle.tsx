
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  // To avoid hydration mismatch, we'll render a placeholder first,
  // and then determine the theme on the client.
  const [isClient, setIsClient] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  // This effect runs only once on the client to set the initial state
  React.useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // If no theme is saved, respect the user's system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // This effect runs whenever isDarkMode changes, but only on the client
  React.useEffect(() => {
    if (!isClient) return; // Guard against running on the server
    
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, isClient]);

  // Don't render the switch on the server or during the initial client render
  // to prevent the hydration mismatch.
  if (!isClient) {
    return (
        <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-foreground/60" />
            <div className="h-6 w-11 rounded-full bg-input"></div>
            <Moon className="h-5 w-5 text-foreground/60" />
        </div>
    );
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
