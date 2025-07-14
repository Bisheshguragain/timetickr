"use client";

import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { onValue, ref } from "firebase/database";

export function usePlanSync() {
  const { currentUser, firebaseServices, setPlan } = useTimer();

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) return;

    const planRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);

    const unsubscribe = onValue(planRef, (snapshot) => {
      const planValue = snapshot.val();
      if (planValue) {
        setPlan(planValue);
      } else {
        // If no plan is set in DB, default to Freemium
        setPlan("Freem