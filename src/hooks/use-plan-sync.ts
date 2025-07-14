
"use client";

import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { onValue, ref } from "firebase/database";

export function usePlanSync() {
  const { currentUser, firebaseServices, plan, setPlan } = useTimer();

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) return;

    const planRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);

    // Set up a real-time listener for any subsequent plan changes
    const unsubscribe = onValue(planRef, (snapshot) => {
      const updatedPlan = snapshot.val();
      if (updatedPlan && updatedPlan !== plan) {
        setPlan(updatedPlan);
      } else if (!updatedPlan && plan !== "Freemium") {
        setPlan("Freemium");
      }
    });

    return () => unsubscribe();
  }, [currentUser, firebaseServices.db, plan, setPlan]);
}
