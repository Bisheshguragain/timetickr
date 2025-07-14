"use client";

import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { getFromStorage, setInStorage } from "@/lib/storage-utils";

export function useUsageReset() {
  const { currentUser, resetUsage } = useTimer();

  useEffect(() => {
    if (!currentUser) return;

    const usageKey = `timerUsage_${currentUser.uid}`;
    const usageData = getFromStorage(usageKey, { used: 0, extra: 0, month: new Date().getMonth() });
    const currentMonth = new Date().getMonth();

    if (usageData?.month !== currentMonth) {
      console.log("New month detected, resetting usage.");
      resetUsage();
    }
  }, [currentUser, resetUsage]);
}