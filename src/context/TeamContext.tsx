
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref, onValue, set, update, off, get, push, serverTimestamp } from "firebase/database";
import { useFirebase } from "@/hooks/use-firebase";
import { getFromStorage, setInStorage } from "@/lib/storage-utils";

export interface TeamMember {
    name: string;
    email: string;
    role: "Admin" | "Speaker" | "Viewer";
    status: "Active" | "Pending" | "Inactive";
    avatar: string;
}

interface TeamContextProps {
  teamMembers: TeamMember[];
  inviteTeamMember: (email: string, role: TeamMember['role']) => void;
  updateMemberStatus: (email: string, status: TeamMember['status']) => void;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  currentUser: User | null;
  loadingAuth: boolean;
  teamId: string | null;
  setTeamId: (teamId: string | null) => void;
}

const TeamContext = createContext<TeamContextProps | undefined>(undefined);

const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

type TeamProviderProps = {
  children: React.ReactNode;
};

export const TeamProvider = ({ children }: TeamProviderProps) => {
  const firebaseServices = useFirebase();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customLogo, setCustomLogoState] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // This effect runs once to determine the teamId, either from localStorage or by generating a new one.
  useEffect(() => {
    const storedTeamId = getFromStorage('sessionCode', null);
    if (storedTeamId) {
      setTeamId(storedTeamId);
    } else {
      const newTeamId = generateSessionCode();
      setTeamId(newTeamId);
      setInStorage('sessionCode', newTeamId);
    }
  }, []);

  // This effect handles user authentication state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [firebaseServices.auth]);
  
  const teamDbRef = useMemo(() => {
    if (teamId) {
      return ref(firebaseServices.db, `sessions/${teamId}`);
    }
    return null;
  }, [teamId, firebaseServices.db]);
  
  // This effect syncs team data from Firebase when the teamId changes.
  useEffect(() => {
    if (!teamDbRef) return;

    const listener = onValue(teamDbRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      setTeamMembers(data.teamMembers || []);
      setCustomLogoState(data.customLogo || null);
    });

    return () => off(teamDbRef, 'value', listener);
  }, [teamDbRef]);

  // This effect writes local team state changes back to Firebase.
  useEffect(() => {
    if (!teamDbRef || !currentUser) return; // Only write if a user is logged in
    
    // Avoid overwriting db on initial load before local state is synced
    if(teamMembers.length > 0 || customLogo) {
      update(teamDbRef, {
        teamMembers,
        customLogo,
      });
    }
  }, [teamMembers, customLogo, teamDbRef, currentUser]);
  
  const logAudit = useCallback((event: { action: string; metadata?: Record<string, any> }) => {
    if (!currentUser || !firebaseServices?.db) return;
    try {
      const logRef = push(ref(firebaseServices.db, `auditLogs/${currentUser.uid}`));
      set(logRef, {
        actor: currentUser.email,
        timestamp: serverTimestamp(),
        ...event,
      });
    } catch (error) {
      console.error("Failed to write to audit log:", error);
    }
  }, [currentUser, firebaseServices]);

  const inviteTeamMember = (email: string, role: TeamMember['role']) => {
    if (!teamDbRef) return;
    const newMember: TeamMember = { name: 'Invited User', email, role, status: 'Pending', avatar: `https://i.pravatar.cc/40?u=${email}` };
    const newTeam = [...teamMembers, newMember];
    setTeamMembers(newTeam);
    logAudit({ action: 'team_member_invited', metadata: { invitedEmail: email, role: role }});
  };

  const updateMemberStatus = (email: string, status: TeamMember['status']) => {
    if (!teamDbRef) return;
    const newTeam = teamMembers.map(member => member.email === email ? { ...member, status } : member);
    setTeamMembers(newTeam);
  };
  
  const setCustomLogo = (logo: string | null) => {
    if (!teamDbRef || !currentUser) return;
    setCustomLogoState(logo);
    if(currentUser) {
      const logoKey = `customLogo_${currentUser.uid}`;
      setInStorage(logoKey, logo);
    }
  };

  const value = {
    teamMembers,
    inviteTeamMember,
    updateMemberStatus,
    customLogo,
    setCustomLogo,
    currentUser,
    loadingAuth,
    teamId,
    setTeamId,
  };

  return (
    <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
