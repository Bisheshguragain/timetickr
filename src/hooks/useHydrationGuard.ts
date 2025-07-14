
"use client";

import { useEffect, useState } from "react";

export function useHydrationGuard(label = "HydrationGuard") {
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    const width = window.innerWidth;
    setViewportWidth(width);

    console.log(`[${label}] Hydrated ✅`);
    console.log(`[${label}] Viewport width: ${width}px`);
  }, [label]);

  return {
    isHydrated,
    viewportWidth,
  };
}
