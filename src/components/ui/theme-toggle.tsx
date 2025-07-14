
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    // Render a placeholder on the server and during initial client render
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
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="h-5 w-5 text-foreground/60" />
    </div>
  );
}
