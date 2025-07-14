
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  React.useEffect(() => {
    if (mounted) {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }
  }, [isDarkMode, mounted]);

  if (!mounted) {
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
