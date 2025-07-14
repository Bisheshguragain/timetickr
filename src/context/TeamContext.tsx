
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

  const teamDbRef = useMemo(() => {
    if (teamId) {
      return ref(firebaseServices.db, `sessions/${teamId}`);
    }
    return null;
  }, [teamId, firebaseServices.db]);
  
  useEffect(() => {
    if (!teamId) {
        const getOrCreateCode = (key: string) => {
            let code = localStorage.getItem(key);
            if (!code) {
                code = generateSessionCode();
                localStorage.setItem(key, code);
            }
            return code;
        }
        setTeamId(getOrCreateCode('sessionCode'));
    }
  }, [teamId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [firebaseServices.auth]);

  useEffect(() => {
    if (!currentUser) {
        setTeamMembers([]);
        return;
    };
    const userAsTeamMember: TeamMember = {
        name: "You",
        email: currentUser.email!,
        role: "Admin",
        status: "Active",
        avatar: `https://i.pravatar.cc/40?u=${currentUser.email}`
    };
    setTeamMembers(prev => {
        const userExists = prev.some(m => m.email === currentUser.email);
        if (!userExists) return [userAsTeamMember, ...prev.filter(m => m.email !== currentUser.email)];
        return prev.map(m => m.email === currentUser.email ? userAsTeamMember : m);
    });
  }, [currentUser]);

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

  useEffect(() => {
    if (!teamDbRef) return;
    update(teamDbRef, {
        teamMembers,
        customLogo,
    });
  }, [teamMembers, customLogo, teamDbRef]);
  
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
