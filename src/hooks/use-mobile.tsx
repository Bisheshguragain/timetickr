
"use client"

import * as React from "react"

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState<null | boolean>(null);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    checkIsMobile();
    
    window.addEventListener("resize", checkIsMobile);
    
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}
