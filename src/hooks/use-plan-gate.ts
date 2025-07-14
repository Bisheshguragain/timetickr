
"use client";

import { useTimer } from "@/context/TimerContext";

export function usePlanGate() {
  const { plan } = useTimer();

  return {
    isFreemium: plan === "Freemium",
    isStarter: plan === "Starter",
    isProfessional: plan === "Professional",
    isEnterprise: plan === "Enterprise",

    canUseAi: plan === "Professional" || plan === "Enterprise",
    canUseTts: plan === "Enterprise",
    canInviteAdmins: plan === "Professional" || plan === "Enterprise",
    canUploadLogo: plan === "Enterprise",
    hasAnalyticsExport: plan === "Enterprise",
    hasSmartAlerts: plan === "Professional" || plan === "Enterprise",
    memberLimit: plan === "Starter" ? 3 : plan === "Freemium" ? 1 : -1,
  };
}
