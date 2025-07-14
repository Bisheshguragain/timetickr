
"use client";

import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { onValue, ref, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

export function usePlanSync() {
  const { currentUser, firebaseServices, plan, setPlan } = useTimer();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) {
        if (plan !== "Freemium") setPlan("Freemium");
        return;
    };

    const planRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);

    // Perform an initial fetch to ensure correctness on load
    get(planRef).then(snapshot => {
      const latestPlan = snapshot.val() || "Freemium";
      if (latestPlan !== plan) {
        setPlan(latestPlan);
        toast({
          title: "Plan Synced",
          description: `Your plan has been set to "${latestPlan}".`,
        });
      }
    });

    // Then, set up a real-time listener for any subsequent changes
    const unsubscribe = onValue(planRef, (snapshot) => {
      const updatedPlan = snapshot.val();
      if (updatedPlan && updatedPlan !== plan) {
        setPlan(updatedPlan);
      } else if (!updatedPlan && plan !== "Freemium") {
        setPlan("Freemium");
      }
    });

    return () => unsubscribe();
  }, [currentUser, firebaseServices, setPlan, toast]); // Removed 'plan' from dependencies to avoid loops
}
