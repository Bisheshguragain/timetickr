
"use client";

import { useTimer } from "@/context/TimerContext";

export function useFeatureFlag(flag: keyof typeof initialFeatureFlags) {
  const { featureFlags } = useTimer();
  return featureFlags?.[flag] ?? false;
}

// We need to define this here to avoid circular dependencies
const initialFeatureFlags = {
    showDashboardRollup: false,
};
