
"use client";

import { useTimer } from "@/context/TimerContext";
import { useTeam } from "@/context/TeamContext";

export function usePlanGate() {
  const { plan } = useTimer();
  const { teamMembers } = useTeam();

  const isFreemium = plan === "Freemium";
  const isStarter = plan === "Starter";
  const isProfessional = plan === "Professional";
  const isEnterprise = plan === "Enterprise";

  const memberLimit = isStarter ? 3 : isFreemium ? 1 : -1;
  const canInviteMoreMembers = memberLimit === -1 || teamMembers.length < memberLimit;

  return {
    isFreemium,
    isStarter,
    isProfessional,
    isEnterprise,
    canUseAi: isProfessional || isEnterprise,
    canUseTts: isEnterprise,
    canInviteAdmins: isProfessional || isEnterprise,
    canUploadLogo: isEnterprise,
    hasAnalyticsExport: isEnterprise,
    hasSmartAlerts: isProfessional || isEnterprise,
    memberLimit,
    canInviteMoreMembers,
  };
}
