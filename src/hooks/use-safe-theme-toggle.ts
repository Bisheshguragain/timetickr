
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useSafeThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch by waiting until mounted
    setMounted(true);
  }, []);

  const actualTheme = theme === "system" ? systemTheme : theme;

  function toggleTheme() {
    setTheme(actualTheme === "dark" ? "light" : "dark");
  }

  return {
    actualTheme: mounted ? actualTheme : undefined, // Return undefined on server/initial render
    toggleTheme,
    isReady: mounted
  };
}
