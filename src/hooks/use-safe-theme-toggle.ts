
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
    actualTheme: mounted ? actualTheme : "dark", // safe fallback to dark
    toggleTheme,
    isReady: mounted
  };
}
