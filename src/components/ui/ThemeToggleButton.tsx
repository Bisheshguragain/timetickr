
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./skeleton";

export default function ThemeToggleButton() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  if (!mounted) {
    // Render a placeholder skeleton to prevent layout shift and hydration mismatch
    return <Skeleton className="h-10 w-10" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="transition-colors duration-300"
    >
      {currentTheme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.836 17.836a.75.75 0 00-1.06-1.06l-1.59 1.591a.75.75 0 101.06 1.06l1.59-1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.164 17.836a.75.75 0 00-1.06 1.06l-1.591-1.59a.75.75 0 001.06-1.061l1.591 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.106 6.106a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.934 2.167-7.47 5.54-9.462a.75.75 0 01.819.162z" clipRule="evenodd" />
        </svg>
      )}
    </Button>
  );
}
