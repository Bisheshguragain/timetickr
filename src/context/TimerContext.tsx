
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
import { ref, onValue, set, update, off, get, type Database, push, serverTimestamp } from "firebase/database";
import { useFirebase } from "@/hooks/use-firebase"; // Import the new hook
import type { FirebaseServices } from "@/lib/firebase-types";
import { generateAlerts, GenerateAlertsInput, GenerateAlertsOutput } from "@/ai/flows/generate-alerts-flow";
import { moderateMessage } from "@/ai/flows/moderate-message";
import { getFromStorage, setInStorage } from "@/lib/storage-utils";
import { useToast } from "@/hooks/use-toast";


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
export type SubscriptionPlan = "Freemium" | "Starter" | "Professional" | "Enterprise" | "TimerAddon";

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
    Freemium: 3,
    Starter: 10,
    Professional: 50,
    Enterprise: -1, // -1 for unlimited
    TimerAddon: 0,
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
  sendAdminMessage: (text: string) => Promise<void>;
  dismissAdminMessage: () => void;
  audienceQuestionMessage: Message | null;
  sendAudienceQuestionMessage: (question: AudienceQuestion, resend?: boolean) => Promise<void>;
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
  generateAndLoadAlerts: (input: GenerateAlertsInput) => Promise<GenerateAlertsOutput>;
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
  
  const { toast } = useToast();
  
  const isFinished = time === 0;
  const alertTimeouts = useRef<NodeJS.Timeout[]>([]);
  const lastActionTimestamps = useRef<Record<string, number>>({});
  const isUpdatingFromDb = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const dbRef = useMemo(() => {
    if (sessionCode) {
      return ref(firebaseServices.db, `sessions/${sessionCode}`);
    }
    return null;
  }, [sessionCode, firebaseServices.db]);
  
  const logAudit = useCallback((event: { action: string; metadata?: Record<string, any> }) => {
    if (!currentUser || !firebaseServices?.db) return;
    
    try {
      const logRef = push(ref(firebaseServices.db, `auditLogs/${currentUser.uid}`));
      set(logRef, {
        actor: currentUser.email,
        timestamp: Date.now(),
        ...event,
      });
    } catch (error) {
      console.error("Failed to write to audit log:", error);
    }
  }, [currentUser, firebaseServices]);

  const ACTION_COOLDOWNS = {
    send_message: 3000, // 3 seconds
    generate_alerts: 10000, // 10 seconds
    approve_question: 3000, // 3 seconds
    submit_question: 5000, // 5 seconds
  };

  const isActionAllowed = (action: keyof typeof ACTION_COOLDOWNS) => {
    const now = Date.now();
    const lastActionTime = lastActionTimestamps.current[action] || 0;
    if (now - lastActionTime < ACTION_COOLDOWNS[action]) {
        return false;
    }
    lastActionTimestamps.current[action] = now;
    return true;
  };

  const sendAdminMessage = useCallback(async (text: string) => {
    if (!dbRef) throw new Error("Database connection not available.");
    if (!isActionAllowed('send_message')) throw new Error("Please wait before sending another message.");
    
    const canUseAi = plan === "Professional" || plan === "Enterprise";
    if (canUseAi) {
        logAudit({ action: 'message_moderation_started', metadata: { message: text }});
        const moderationResult = await moderateMessage({ message: text });
        if (!moderationResult.isSafe) {
            logAudit({ action: 'message_blocked', metadata: { message: text, reason: moderationResult.reason }});
            toast({
                variant: "destructive",
                title: "Message Blocked",
                description: `Reason: ${moderationResult.reason}`,
            });
            throw new Error(`Message blocked: ${moderationResult.reason}`);
        }
    }
    
    const newMessage = { id: Date.now(), text };
    setAdminMessage(newMessage);
    await update(dbRef, { adminMessage: newMessage });
    logAudit({ action: 'admin_message_sent', metadata: { message: text }});

    const newAnalytics = { ...analytics, messagesSent: analytics.messagesSent + 1, };
    setAnalytics(newAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, newAnalytics);
    }
  }, [dbRef, plan, analytics, currentUser, logAudit, toast]);

  const clearAlertTimeouts = useCallback(() => {
    alertTimeouts.current.forEach(clearTimeout);
    alertTimeouts.current = [];
  }, []);

  useEffect(() => {
    if (isActive && time > 0) {
        intervalRef.current = setInterval(() => {
            if (!sessionCodeFromProps) { 
                setTime((prevTime) => prevTime - 1);
            }
        }, 1000);

        if (scheduledAlerts && !sessionCodeFromProps) {
            clearAlertTimeouts(); // Clear any old timeouts before setting new ones
            const remainingTime = time;
            scheduledAlerts.forEach(alert => {
                const timeUntilAlert = remainingTime - (initialDuration - alert.time);
                if (timeUntilAlert > 0) {
                    const timeoutId = setTimeout(async () => {
                       await sendAdminMessage(`(AUTO) ${alert.message}`);
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
}, [isActive, time, sessionCodeFromProps, scheduledAlerts, initialDuration, sendAdminMessage, clearAlertTimeouts]);


  useEffect(() => {
    if (sessionCodeFromProps) {
        setSessionCode(sessionCodeFromProps);
    } else if (!sessionCode) {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [firebaseServices.auth]);

  useEffect(() => {
    if (!dbRef) return;
    
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
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
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
    if (loadingAuth || !currentUser) return;

    const usageKey = `timerUsage_${currentUser.uid}`;
    const usageData = getFromStorage(usageKey, { used: 0, extra: 0, month: new Date().getMonth() });
    setTimersUsed(usageData.used);
    setExtraTimers(usageData.extra);

    const analyticsKey = `timerAnalytics_${currentUser.uid}`;
    const savedAnalytics = getFromStorage(analyticsKey, initialAnalytics);
    setAnalytics(savedAnalytics);

    const logoKey = `customLogo_${currentUser.uid}`;
    const savedLogo = getFromStorage(logoKey, null);
    if (savedLogo) setCustomLogoState(savedLogo);
  }, [currentUser, loadingAuth]);


  const baseTimerLimit = PLAN_LIMITS[plan] ?? 3;
  const timerLimit = baseTimerLimit === -1 ? -1 : baseTimerLimit + extraTimers;

  const consumeTimerCredit = () => {
    if (!currentUser || (timerLimit !== -1 && timersUsed >= timerLimit)) {
      console.warn("Timer usage limit reached or no user.");
      return;
    }
    const newUsage = timersUsed + 1;
    setTimersUsed(newUsage);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: newUsage, extra: extraTimers, month: new Date().getMonth() });
    update(ref(firebaseServices.db, `users/${currentUser.uid}/usage`), { used: newUsage });


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
      logAudit({ action: 'timer_started', metadata: { duration: initialDuration }});
    } else {
      logAudit({ action: 'timer_paused', metadata: { time_remaining: time }});
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
    logAudit({ action: 'timer_reset' });
  };

  const setDuration = (duration: number) => {
    if (!dbRef || isActive) return;
    setInitialDuration(duration);
    setTime(duration);
    update(dbRef, { time: duration, initialDuration: duration });
  };

  const dismissAdminMessage = () => {
    if (!dbRef) return;
    setAdminMessage(null);
    update(dbRef, { adminMessage: null });
    logAudit({ action: 'admin_message_dismissed' });
  };

  const updateAudienceQuestionStatus = useCallback((id: number, status: AudienceQuestion['status']) => {
    if (!dbRef) return;
    const updatedQuestions = audienceQuestions.map(q => q.id === id ? { ...q, status } : q);
    setAudienceQuestions(updatedQuestions);
    update(dbRef, { audienceQuestions: updatedQuestions });
    logAudit({ action: 'question_status_updated', metadata: { questionId: id, newStatus: status }});
  }, [dbRef, audienceQuestions, logAudit]);

  const sendAudienceQuestionMessage = useCallback(async (question: AudienceQuestion, resend: boolean = false) => {
    if (!dbRef) throw new Error("Database connection not available.");
    if (!isActionAllowed('approve_question')) throw new Error("Please wait before approving another question.");

    const canUseAi = plan === "Professional" || plan === "Enterprise";
    if (canUseAi && !resend) {
        logAudit({ action: 'question_moderation_started', metadata: { questionId: question.id, text: question.text }});
        const moderationResult = await moderateMessage({ message: question.text });
        if (!moderationResult.isSafe) {
            updateAudienceQuestionStatus(question.id, 'dismissed');
            logAudit({ action: 'question_blocked_by_ai', metadata: { questionId: question.id, reason: moderationResult.reason }});
            toast({
                variant: "destructive",
                title: "Question Blocked",
                description: `Reason: ${moderationResult.reason}`,
            });
            throw new Error(`Question blocked: ${moderationResult.reason}`);
        }
    }

    const newMessage = { id: question.id, text: question.text };
    setAudienceQuestionMessage(newMessage);
    await update(dbRef, { audienceQuestionMessage: newMessage });
    
    if (!resend) {
        updateAudienceQuestionStatus(question.id, 'approved');
        logAudit({ action: 'question_approved_and_sent', metadata: { questionId: question.id, text: question.text }});
    } else {
        logAudit({ action: 'question_resent', metadata: { questionId: question.id, text: question.text }});
    }

    const newAnalytics = { ...analytics, messagesSent: analytics.messagesSent + 1 };
    setAnalytics(newAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, newAnalytics);
    }
  }, [dbRef, plan, analytics, currentUser, logAudit, toast, updateAudienceQuestionStatus]);


  const dismissAudienceQuestionMessage = () => {
    if (!dbRef) return;
    setAudienceQuestionMessage(null);
    update(dbRef, { audienceQuestionMessage: null });
    logAudit({ action: 'audience_question_dismissed_from_view' });
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
    if (!isActionAllowed('submit_question')) {
        toast({ variant: "destructive", title: "Slow down!", description: "Please wait a moment before submitting another question."});
        return;
    }

    if (text.length > 300) {
        toast({ variant: "destructive", title: "Question too long", description: "Please keep questions under 300 characters."});
        return;
    }

    get(ref(firebaseServices.db, `sessions/${sessionCode}/audienceQuestions`)).then(snapshot => {
        const currentQuestions = snapshot.val() || [];
        const newQuestion: AudienceQuestion = { id: Date.now(), text, status: 'pending' };
        update(dbRef, { audienceQuestions: [...currentQuestions, newQuestion] });
        logAudit({ action: 'question_submitted_by_audience', metadata: { text: text }});
    });
  };

  const inviteTeamMember = (email: string, role: TeamMember['role']) => {
    if (!dbRef) return;
    const newMember: TeamMember = { name: 'Invited User', email, role, status: 'Pending', avatar: `https://i.pravatar.cc/40?u=${email}` };
    const newTeam = [...teamMembers, newMember];
    setTeamMembers(newTeam);
    update(dbRef, { teamMembers: newTeam });
    logAudit({ action: 'team_member_invited', metadata: { invitedEmail: email, role: role }});
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
    update(ref(firebaseServices.db, `users/${currentUser.uid}/usage`), { extra: newExtraTimers });
  };
  
  const resetUsage = useCallback(() => {
    if (!currentUser) return;
    const usageKey = `timerUsage_${currentUser.uid}`;
    setTimersUsed(0);
    setExtraTimers(0);
    setInStorage(usageKey, { used: 0, extra: 0, month: new Date().getMonth() });
    update(ref(firebaseServices.db, `users/${currentUser.uid}/usage`), {
        used: 0,
        extra: 0,
        month: new Date().getMonth(),
     });
  }, [currentUser, firebaseServices.db]);

  
  const resetAnalytics = () => {
    if (!currentUser || (plan !== 'Professional' && plan !== 'Enterprise')) return;
    setAnalytics(initialAnalytics);
    if(currentUser) {
      const analyticsKey = `timerAnalytics_${currentUser.uid}`;
      setInStorage(analyticsKey, initialAnalytics);
    }
    logAudit({ action: 'analytics_reset' });
  }

  const generateAndLoadAlerts = useCallback(async (input: GenerateAlertsInput): Promise<GenerateAlertsOutput> => {
    if (!isActionAllowed('generate_alerts')) {
        throw new Error("Please wait before generating another schedule.");
    }
    logAudit({ action: 'alerts_generation_started', metadata: { input }});
    const result = await generateAlerts(input);
    setScheduledAlerts(result.alerts);
    logAudit({ action: 'alerts_generation_finished', metadata: { alertCount: result.alerts.length }});
    return result;
  }, [logAudit]);
  
  const logout = async () => {
    try {
      const uid = currentUser?.uid;
      await signOut(firebaseServices.auth);
      // Clear all local state
      setCurrentUser(null);
      setPlanState("Freemium");
      setTeamMembers([]);
      setCustomLogoState(null);
      setScheduledAlerts(null);
      setAudienceQuestions([]);
      setAdminMessage(null);
      setAudienceQuestionMessage(null);
      setAnalytics(initialAnalytics);
      setTimersUsed(0);
      setExtraTimers(0);
      
      // Clear local storage for the logged-out user
      if (typeof window !== "undefined" && uid) {
        localStorage.removeItem(`timerAnalytics_${uid}`);
        localStorage.removeItem(`timerUsage_${uid}`);
        localStorage.removeItem(`customLogo_${uid}`);
        localStorage.removeItem('sessionCode');
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
    firebaseServices, generateAndLoadAlerts, logout
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
