
"use client";

import { useEffect, useRef } from "react";
import { useTimer } from "@/context/TimerContext";
import { ref, set, get, onDisconnect } from "firebase/database";

export function useTimerPersistence() {
  const { currentUser, isActive, time, firebaseServices, setDuration, toggleTimer } = useTimer();
  const timeRef = useRef(time);
  timeRef.current = time;

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) return;

    const timerStateRef = ref(firebaseServices.db, `users/${currentUser.uid}/timerState`);

    // On start or pause, update the persisted state
    set(timerStateRef, {
      timeLeft: time,
      isActive: isActive,
      persistedAt: Date.now()
    });
    
    // If the user disconnects (closes tab), ensure the timer is marked as inactive
    const onDisconnectRef = onDisconnect(timerStateRef);
    onDisconnectRef.set({
      timeLeft: timeRef.current,
      isActive: false,
      persistedAt: Date.now()
    });

    // When the component unmounts cleanly (e.g., logout), also mark as inactive
    return () => {
      onDisconnectRef.cancel(); // Cancel the onDisconnect handler
      set(timerStateRef, {
        timeLeft: timeRef.current,
        isActive: false,
        persistedAt: Date.now()
      });
    };
  }, [isActive, currentUser, firebaseServices, time]);

  // This effect runs only once when the component mounts and the user is available
  useEffect(() => {
    const restoreTimer = async () => {
      if (!currentUser || !firebaseServices?.db) return;

      const timerStateRef = ref(firebaseServices.db, `users/${currentUser.uid}/timerState`);
      const snapshot = await get(timerStateRef);
      const saved = snapshot.val();

      // If there's a saved, active timer state from a previous session
      if (saved && saved.isActive && saved.timeLeft > 0) {
        // We need to calculate the time that has passed since it was last persisted
        const timePassed = Math.floor((Date.now() - saved.persistedAt) / 1000);
        const newTime = Math.max(0, saved.timeLeft - timePassed);

        if (newTime > 0) {
            setDuration(newTime);
            // The main context will handle syncing state from the DB,
            // so we don't need to call toggleTimer() here.
        }
      }
    };

    if (currentUser) {
        restoreTimer();
    }
    
  // We only want this to run once on initial load for a user.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, firebaseServices]);
}

