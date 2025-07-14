
"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set the initial value after the component mounts
    checkIsMobile();
    
    // Add event listener for future changes
    window.addEventListener("resize", checkIsMobile);
    
    // Cleanup the event listener on unmount
    return () => window.removeEventListener("resize", checkIsiMobile);
  }, []);

  return isMobile;
}
