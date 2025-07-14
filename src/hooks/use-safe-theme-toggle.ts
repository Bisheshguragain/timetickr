
"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function useSafeThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const actualTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(actualTheme === "dark" ? "light" : "dark");
  };

  return {
    actualTheme,
    toggleTheme,
    isReady: mounted,
  };
}
