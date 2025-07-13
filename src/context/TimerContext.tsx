"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { ref, onValue, set, update, off, get, type Database } from "firebase/database";
import { useFirebase } from "@/hooks/use-firebase"; // Import the new hook
import type { FirebaseServices } from "@/lib/firebase-types";
import type { GenerateAlertsOutput } from "@/ai/flows/generate-alerts-flow";

interface Message {
  id: number;
  text: string;
}

export interface AudienceQuestion {
    id: number;
    text: string;
    status: 'pending' | 'approved' | 'dismissed';
}

export interface TeamMember {
    name: string;
    email: string;
    role: "Admin" | "Speaker" | "Viewer";
    status: "Active" | "Pending" | "Inactive";
    avatar: string;
}

export type TimerTheme = "Classic" | "Modern" | "Minimalist" | "Industrial";
export type SubscriptionPlan = "Freemium" | "Starter" | "Professional" | "Enterprise";

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
    Freemium: 3,
    Starter: 10,
    Professional: 50,
    Enterprise: -1, // -1 for unlimited
};

interface AnalyticsData {
  totalTimers: number;
  avgDuration: number;
  messagesSent: number;
  maxSpeakers: number;
  maxAudience: number;
  durationBrackets: {
    "0-5": number;
    "5-15": number;
    "15-30": number;
    "30-60": number;
    "60+": number;
  };
}

interface TimerContextProps {
  time: number;
  setTime: (time: number) => void;
  isActive: boolean;
  isFinished: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
  adminMessage: Message | null;
  sendAdminMessage: (text: string) => void;
  dismissAdminMessage: () => void;
  audienceQuestionMessage: Message | null;
  sendAudienceQuestionMessage: (text: string) => void;
  dismissAudienceQuestionMessage: () => void;
  theme: TimerTheme;
  setTheme: (theme: TimerTheme) => void;
  plan: SubscriptionPlan;
  setPlan: (plan: SubscriptionPlan) => void;
  speakerDevices: number;
  participantDevices: number;
  timersUsed: number;
  timerLimit: number;
  consumeTimerCredit: () => void;
  resetUsage: () => void;
  addTimers: (quantity: number) => void;
  analytics: AnalyticsData;
  resetAnalytics: () => void;
  sessionCode: string | null;
  audienceQuestions: AudienceQuestion[];
  submitAudienceQuestion: (text: string) => void;
  updateAudienceQuestionStatus: (id: number, status: AudienceQuestion['status']) => void;
  teamMembers: TeamMember[];
  inviteTeamMember: (email: string, role: TeamMember['role']) => void;
  updateMemberStatus: (email: string, status: TeamMember['status']) => void;
  currentUser: User | null;
  loadingAuth: boolean;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  isSessionFound: boolean | null;
  firebaseServices: FirebaseServices;
  scheduledAlerts: GenerateAlertsOutput['alerts'] | null;
  setScheduledAlerts: (alerts: GenerateAlertsOutput['alerts'] | null) => void;
  logout: () => Promise<void>;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const initialAnalytics: AnalyticsData = {
    totalTimers: 0,
    avgDuration: 0,
    messagesSent: 0,
    maxSpeakers: 0,
    maxAudience: 0,
    durationBrackets: { "0-5": 0, "5-15": 0, "15-30": 0, "30-60": 0, "60+": 0 },
};

const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

type TimerProviderProps = {
  children: React.ReactNode;
  sessionCode?: string | null;
};


export const TimerProvider = ({ children, sessionCode: sessionCodeFromProps }: TimerProviderProps) => {
  const firebaseServices = useFirebase();
  const [initialDuration, setInitialDuration] = useState(900);
  const [time, setTime] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [adminMessage, setAdminMessage] = useState<Message | null>(null);
  const [audienceQuestionMessage, setAudienceQuestionMessage] = useState<Message | null>(null);
  const [theme, setThemeState] = useState<TimerTheme>("Classic");
  const [plan, setPlanState] = useState<SubscriptionPlan>("Freemium");
  const [speakerDevices, setSpeakerDevices] = useState(0);
  const [participantDevices, setParticipantDevices] = useState(0);
  const [timersUsed, setTimersUsed] = useState(0);
  const [extraTimers, setExtraTimers] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [audienceQuestions, setAudienceQuestions] = useState<AudienceQuestion[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [customLogo, setCustomLogoState] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(sessionCodeFromProps || null);
  const [isSessionFound, setIsSessionFound] = useState<boolean | null>(null);
  const [scheduledAlerts, setScheduledAlerts] = useState<GenerateAlertsOutput['alerts'] | null>(null);

  const isFinished = time === 0;
  const alertTimeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (sessionCodeFromProps) {
        setSessionCode(sessionCodeFromProps);
    } else if (!sessionCode) {
        // This now runs only on the client, after the initial render, preventing hydration mismatch
        const getOrCreateCode = (key: string) => {
            let code = localStorage.getItem(key);
            if (!code) {
                code = generateSessionCode();
                localStorage.setItem(key, code);
            }
            return code;
        }
        setSessionCode(getOrCreateCode('sessionCode'));
    }
  }, [sessionCodeFromProps, sessionCode]);

  const dbRef = useMemo(() => {
    if (sessionCode) {
      return ref(firebaseServices.db, `sessions/${sessionCode}`);
    }
    return null;
  }, [sessionCode, firebaseServices.db]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [firebaseServices.auth]);

  const isUpdatingFromDb = useRef(false);

  // Firebase session listener
  useEffect(() => {
    if (!dbRef) return;
    
    // If we are the host, ensure the session exists.
    if (!sessionCodeFromProps) {
        get(dbRef).then(snapshot => {
            if (!snapshot.exists()) {
                 const initialData = {
                    time: initialDuration,
                    isActive: false,
                    initialDuration: initialDuration,
                    adminMessage: null,
                    audienceQuestionMessage: null,
                    theme: "Classic",
                    audienceQuestions: [],
                    teamMembers: [],
                    customLogo: null,
                    scheduledAlerts: null,
                    connections: { speakers: 0, participants: 0 },
                };
                set(dbRef, initialData).then(() => {
                   setIsSessionFound(true);
                });
            } else {
                setIsSessionFound(true);
            }
        });
    }

    const listener = onValue(dbRef, (snapshot) => {
        if (!snapshot.exists()) {
            if(sessionCodeFromProps) {
                // If it's a client and session disappears, mark as not found.
                setIsSessionFound(false);
            }
            return;
        }
        
        setIsSessionFound(true);
        const data = snapshot.val();
        
        isUpdatingFromDb.current = true;
        setTime(data.time ?? initialDuration);
        setIsActive(data.isActive ?? false);
        setInitialDuration(data.initialDuration ?? 900);
        setAdminMessage(data.adminMessage || null);
        setAudienceQuestionMessage(data.audienceQuestionMessage || null);
        setThemeState(data.theme || "Classic");
        setAudienceQuestions(data.audienceQuestions || []);
        setTeamMembers(data.teamMembers || []);
        setCustomLogoState(data.customLogo || null);
        setScheduledAlerts(data.scheduledAlerts || null);
        setSpeakerDevices(data.connections?.speakers || 0);
        setParticipantDevices(data.connections?.participants || 0);
        
        // Use a short timeout to allow state to propagate before unlocking
        setTimeout(() => {
            isUpdatingFromDb.current = false;
        }, 10);
    });

    return () => {
        if (dbRef) {
            off(dbRef, 'value', listener);
        }
    };
  }, [dbRef, sessionCodeFromProps, initialDuration]);


  // Update DB on state change from admin
  useEffect(() => {
    if (isUpdatingFromDb.current || !dbRef || sessionCodeFromProps) return;
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) return;

    update(dbRef, {
        time,
        isActive,
        initialDuration,
        adminMessage,
        audienceQuestionMessage,
        theme,
        audienceQuestions,
        teamMembers,
        customLogo,
        scheduledAlerts,
    });
  }, [time, isActive, initialDuration, adminMessage, audienceQuestionMessage, theme, audienceQuestions, teamMembers, customLogo, scheduledAlerts, dbRef, sessionCodeFromProps]);

  const setPlan = useCallback((newPlan: SubscriptionPlan) => {
    setPlanState(newPlan);
    if (!currentUser) return;
    const userDbRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);
    set(userDbRef, newPlan);
  }, [currentUser, firebaseServices.db]);

  useEffect(() => {
    if (!currentUser) return;

    // Special override for the enterprise user for testing purposes
    if (currentUser.email === 'enterprise@gmail.com') {
      const userDbRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);
      set(userDbRef, 'Enterprise');
      setPlanState('Enterprise');
    } else {
        const userDbRef = ref(firebaseServices.db, `users/${currentUser.uid}/plan`);
        get(userDbRef).then(snapshot => {
          if (snapshot.exists()) {
            setPlanState(snapshot.val());
          } else {
            // New user, assign Freemium by default
            const newPlan = "Freemium";
            set(userDbRef, newPlan);
            setPlanState(newPlan);
          }
        });
    }

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

  }, [currentUser, firebaseServices.db]);

  const getFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(key);
    try {
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
  }

  const setInStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  const getUsageFromStorage = useCallback(() => {
    const usageKey = currentUser ? `timerUsage_${currentUser.uid}` : 'timerUsage_guest';
    const usage = getFromStorage(usageKey, { used: 0, extra: 0, month: new Date().getMonth() });
    const currentMonth = new Date().getMonth();
    if (usage.month === currentMonth) {
      return usage;
    }
    const newUsage = { used: 0, extra: 0, month: currentMonth };
    setInStorage(usageKey, newUsage);
    return newUsage;
  }, [currentUser]);

  useEffect(() => {
    if (loadingAuth) return;
    const { used, extra } = getUsageFromStorage();
    setTimersUsed(used);
    setExtraTimers(extra);
    
    if (currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      const savedAnalytics = getFromStorage(analyticsKey, initialAnalytics);
      setAnalytics(savedAnalytics);
      const logoKey = `customLogo_${currentUser.uid}`;
      const savedLogo = getFromStorage(logoKey, null);
      if(savedLogo) setCustomLogoState(savedLogo);
    }
  }, [currentUser, loadingAuth, getUsageFromStorage]);

  const baseTimerLimit = PLAN_LIMITS[plan] ?? 3;
  const timerLimit = baseTimerLimit === -1 ? -1 : baseTimerLimit + extraTimers;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAlertTimeouts = () => {
    alertTimeouts.current.forEach(clearTimeout);
    alertTimeouts.current = [];
  };

  // Timer and alert logic
  useEffect(() => {
    clearAlertTimeouts();

    if (isActive && time > 0) {
      // Main countdown timer
      intervalRef.current = setInterval(() => {
        if (!sessionCodeFromProps) { // Only admin dashboard updates time
            setTime((prevTime) => prevTime - 1);
        }
      }, 1000);
      
      // Schedule the smart alerts
      if (scheduledAlerts && !sessionCodeFromProps) {
        const remainingTime = time;
        scheduledAlerts.forEach(alert => {
            const timeUntilAlert = remainingTime - (initialDuration - alert.time);
            if (timeUntilAlert > 0) {
                const timeoutId = setTimeout(() => {
                    sendAdminMessage(alert.message);
                }, timeUntilAlert * 1000);
                alertTimeouts.current.push(timeoutId);
            }
        });
      }

    } else if (time === 0) {
      setIsActive(false);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearAlertTimeouts();
    };
  }, [isActive, time, sessionCodeFromProps, scheduledAlerts, initialDuration]);

  const consumeTimerCredit = () => {
    if (!currentUser || (timerLimit !== -1 && timersUsed >= timerLimit)) {
      console.warn("Timer usage limit reached or no user.");
      return;
    }
    const newUsage = timersUsed + 1;
    setTimersUsed(newUsage);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: newUsage, extra: extraTimers, month: new Date().getMonth() });

    const newTotalTimers = analytics.totalTimers + 1;
    const totalDuration = (analytics.avgDuration * analytics.totalTimers) + initialDuration;
    const newAvgDuration = totalDuration / newTotalTimers;
    const newBrackets = { ...analytics.durationBrackets };
    const durationMins = initialDuration / 60;
    if (durationMins <= 5) newBrackets["0-5"]++;
    else if (durationMins <= 15) newBrackets["5-15"]++;
    else if (durationMins <= 30) newBrackets["15-30"]++;
    else if (durationMins <= 60) newBrackets["30-60"]++;
    else newBrackets["60+"]++;

    const newAnalytics = { ...analytics, totalTimers: newTotalTimers, avgDuration: newAvgDuration, durationBrackets: newBrackets };
    setAnalytics(newAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, newAnalytics);
    }
  };
  
  const toggleTimer = () => {
    if (!dbRef) return;
    if (!isActive) {
      if (timerLimit !== -1 && timersUsed >= timerLimit) return;
      consumeTimerCredit();
    }
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    update(dbRef, { isActive: newIsActive });
  };

  const resetTimer = () => {
    if (!dbRef) return;
    setIsActive(false);
    setTime(initialDuration);
    update(dbRef, { time: initialDuration, isActive: false });
  };

  const setDuration = (duration: number) => {
    if (!dbRef || isActive) return;
    setInitialDuration(duration);
    setTime(duration);
    update(dbRef, { time: duration, initialDuration: duration });
  };

  const sendAdminMessage = (text: string) => {
    if (!dbRef) throw new Error("Database connection not available.");
    const newMessage = { id: Date.now(), text };
    setAdminMessage(newMessage);
    update(dbRef, { adminMessage: newMessage });

    const newAnalytics = { ...analytics, messagesSent: analytics.messagesSent + 1, };
    setAnalytics(newAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, newAnalytics);
    }
  };

  const dismissAdminMessage = () => {
    if (!dbRef) return;
    setAdminMessage(null);
    update(dbRef, { adminMessage: null });
  };

  const sendAudienceQuestionMessage = (text: string) => {
    if (!dbRef) throw new Error("Database connection not available.");
    const newMessage = { id: Date.now(), text };
    setAudienceQuestionMessage(newMessage);
    update(dbRef, { audienceQuestionMessage: newMessage });

    const newAnalytics = { ...analytics, messagesSent: analytics.messagesSent + 1, };
    setAnalytics(newAnalytics);
     if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, newAnalytics);
    }
  };

  const dismissAudienceQuestionMessage = () => {
    if (!dbRef) return;
    setAudienceQuestionMessage(null);
    update(dbRef, { audienceQuestionMessage: null });
  };

  const setTheme = (newTheme: TimerTheme) => {
    if (!dbRef) return;
    setThemeState(newTheme);
    update(dbRef, { theme: newTheme });
  };

  const setCustomLogo = (logo: string | null) => {
    if (!dbRef || !currentUser) return;
    setCustomLogoState(logo);
    if(currentUser) {
      const logoKey = `customLogo_${currentUser.uid}`;
      setInStorage(logoKey, logo);
    }
    update(dbRef, { customLogo: logo });
  }

  const submitAudienceQuestion = (text: string) => {
    if (!dbRef) return;
    get(ref(firebaseServices.db, `sessions/${sessionCode}/audienceQuestions`)).then(snapshot => {
        const currentQuestions = snapshot.val() || [];
        const newQuestion: AudienceQuestion = { id: Date.now(), text, status: 'pending' };
        update(dbRef, { audienceQuestions: [...currentQuestions, newQuestion] });
    });
  };

  const updateAudienceQuestionStatus = (id: number, status: AudienceQuestion['status']) => {
    if (!dbRef) return;
    const updatedQuestions = audienceQuestions.map(q => q.id === id ? { ...q, status } : q);
    setAudienceQuestions(updatedQuestions);
    update(dbRef, { audienceQuestions: updatedQuestions });
  };

  const inviteTeamMember = (email: string, role: TeamMember['role']) => {
    if (!dbRef) return;
    const newMember: TeamMember = { name: 'Invited User', email, role, status: 'Pending', avatar: `https://i.pravatar.cc/40?u=${email}` };
    const newTeam = [...teamMembers, newMember];
    setTeamMembers(newTeam);
    update(dbRef, { teamMembers: newTeam });
  };

  const updateMemberStatus = (email: string, status: TeamMember['status']) => {
    if (!dbRef) return;
    const newTeam = teamMembers.map(member => member.email === email ? { ...member, status } : member);
    setTeamMembers(newTeam);
    update(dbRef, { teamMembers: newTeam });
  };
  
  const addTimers = (quantity: number) => {
    if (!currentUser) return;
    const newExtraTimers = extraTimers + quantity;
    setExtraTimers(newExtraTimers);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: timersUsed, extra: newExtraTimers, month: new Date().getMonth() });
  };
  
  const resetUsage = () => {
    if (!currentUser) return;
    setTimersUsed(0);
    setExtraTimers(0);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: 0, extra: 0, month: new Date().getMonth() });
  };
  
  const resetAnalytics = () => {
    if (!currentUser || (plan !== 'Professional' && plan !== 'Enterprise')) return;
    setAnalytics(initialAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, initialAnalytics);
    }
  }

  const logout = async () => {
    try {
      const uid = currentUser?.uid; // Capture uid before user becomes null
      await signOut(firebaseServices.auth);
      setCurrentUser(null);
      setPlanState("Freemium");
      setTeamMembers([]);
      setCustomLogoState(null);
      setScheduledAlerts(null);
      setAudienceQuestions([]);
      setAdminMessage(null);
      setAudienceQuestionMessage(null);
      setAnalytics(initialAnalytics);
      resetUsage(); // This will clear guest usage if any
      if (typeof window !== "undefined" && uid) {
        localStorage.removeItem(`timerAnalytics_${uid}`);
        localStorage.removeItem(`timerUsage_${uid}`);
        localStorage.removeItem(`customLogo_${uid}`);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = {
    time, setTime, isActive, isFinished, toggleTimer, resetTimer, setDuration,
    adminMessage, sendAdminMessage, dismissAdminMessage,
    audienceQuestionMessage, sendAudienceQuestionMessage, dismissAudienceQuestionMessage,
    theme, setTheme, plan, setPlan, speakerDevices, participantDevices,
    timersUsed, timerLimit, consumeTimerCredit, resetUsage, addTimers,
    analytics, resetAnalytics, sessionCode, audienceQuestions, submitAudienceQuestion,
    updateAudienceQuestionStatus, teamMembers, inviteTeamMember, updateMemberStatus,
    currentUser, loadingAuth, customLogo, setCustomLogo, isSessionFound,
    firebaseServices, scheduledAlerts, setScheduledAlerts, logout
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};