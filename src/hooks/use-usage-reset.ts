
"use client";

import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { getFromStorage, setInStorage } from "@/lib/storage-utils";
import { ref, get, set } from "firebase/database";

export function useUsageReset() {
  const { currentUser, resetUsage, firebaseServices } = useTimer();

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) return;

    const checkReset = async () => {
      const uid = currentUser.uid;
      const usageKey = `timerUsage_${uid}`;
      const currentMonth = new Date().getMonth();

      // Get a fresh read of storage data inside the async function
      const storageData = getFromStorage(usageKey, { used: 0, extra: 0, month: -1 });
      
      const lastResetRef = ref(firebaseServices.db, `users/${uid}/usage/lastResetMonth`);
      
      const snapshot = await get(lastResetRef);
      const serverMonth = snapshot.exists() ? snapshot.val() : -1; // Default to a non-month value

      const needsReset =
        storageData?.month !== currentMonth ||
        serverMonth !== currentMonth;

      if (needsReset) {
        console.log("New month detected, resetting usage across devices.");
        resetUsage(); // This already clears local storage and state
        
        // After resetUsage clears it, we set the new month
        setInStorage(usageKey, {
          used: 0,
          extra: 0,
          month: currentMonth,
        });

        // Also update the server's record of the last reset.
        const userUsageRef = ref(firebaseServices.db, `users/${uid}/usage`);
        await set(userUsageRef, { 
            used: 0, 
            extra: 0, 
            lastResetMonth: currentMonth 
        });
      }
    };

    checkReset();
  }, [currentUser, firebaseServices, resetUsage]);
}
