
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
import { db } from "@/lib/firebase";
import { ref, onValue, set, update, off } from "firebase/database";

interface Message {
  id: number;
  text: string;
}

export interface AudienceQuestion {
    id: number;
    text: string;
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
  message: Message | null;
  sendMessage: (text: string) => void;
  dismissMessage: () => void;
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
  sessionCode: string; // Unified code for speaker and audience
  audienceQuestions: AudienceQuestion[];
  submitAudienceQuestion: (text: string) => void;
  dismissAudienceQuestion: (id: number) => void;
  teamMembers: TeamMember[];
  inviteTeamMember: (email: string, role: TeamMember['role']) => void;
  updateMemberStatus: (email: string, status: TeamMember['status']) => void;
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

const defaultTeam: TeamMember[] = [
    { name: "You", email: "me@example.com", role: "Admin", status: "Active", avatar: "https://placehold.co/40x40.png" },
    { name: "Alex Johnson", email: "alex@example.com", role: "Admin", status: "Active", avatar: "https://placehold.co/40x40.png" },
    { name: "Maria Garcia", email: "maria@example.com", role: "Speaker", status: "Active", avatar: "https://placehold.co/40x40.png" },
    { name: "Sam Wilson", email: "sam@example.com", role: "Viewer", status: "Pending", avatar: "https://placehold.co/40x40.png" },
];


const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const getOrCreateCode = (key: string) => {
    if (typeof window === 'undefined') return '';
    let code = localStorage.getItem(key);
    if (!code) {
        code = generateSessionCode();
        localStorage.setItem(key, code);
    }
    return code;
}


export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialDuration, setInitialDuration] = useState(900);
  const [time, setTime] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [theme, setThemeState] = useState<TimerTheme>("Classic");
  const [plan, setPlanState] = useState<SubscriptionPlan>("Professional");
  const [speakerDevices, setSpeakerDevices] = useState(0);
  const [participantDevices, setParticipantDevices] = useState(0);
  const [timersUsed, setTimersUsed] = useState(0);
  const [extraTimers, setExtraTimers] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [audienceQuestions, setAudienceQuestions] = useState<AudienceQuestion[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const isFinished = time === 0;

  const sessionCode = useMemo(() => getOrCreateCode('sessionCode'), []);

  const baseTimerLimit = PLAN_LIMITS[plan];
  const timerLimit = baseTimerLimit === -1 ? -1 : baseTimerLimit + extraTimers;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dbRef = useMemo(() => ref(db, `sessions/${sessionCode}`), [sessionCode]);
  
  const isUpdatingFromDb = useRef(false);

  const getFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  }
  
  const setInStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  const getUsageFromStorage = () => {
    const usage = getFromStorage('timerUsage', { used: 0, extra: 0, month: new Date().getMonth() });
    const currentMonth = new Date().getMonth();
    if (usage.month === currentMonth) {
      return usage;
    }
    const newUsage = { used: 0, extra: 0, month: currentMonth };
    setInStorage('timerUsage', newUsage);
    return newUsage;
  };

  useEffect(() => {
    const { used, extra } = getUsageFromStorage();
    setTimersUsed(used);
    setExtraTimers(extra);
    const savedAnalytics = getFromStorage('timerAnalytics', initialAnalytics);
    setAnalytics(savedAnalytics);
    const savedQuestions = getFromStorage('audienceQuestions', []);
    setAudienceQuestions(savedQuestions);
    const savedTeam = getFromStorage('teamMembers', defaultTeam);
    setTeamMembers(savedTeam);
  }, []);

  // Firebase listener
  useEffect(() => {
    const listener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            isUpdatingFromDb.current = true;
            setTime(data.time);
            setIsActive(data.isActive);
            setInitialDuration(data.initialDuration);
            setMessage(data.message || null);
            setThemeState(data.theme || "Classic");
            setPlanState(data.plan || "Professional");
            setAudienceQuestions(data.audienceQuestions || []);
            setSpeakerDevices(data.connections?.speakers || 0);
            setParticipantDevices(data.connections?.participants || 0);
            isUpdatingFromDb.current = false;
        }
    });

    return () => {
        off(dbRef, 'value', listener);
    };
  }, [dbRef]);
  
  // Update DB on state change
  useEffect(() => {
    if (isUpdatingFromDb.current) return;

    const role = typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard') ? 'viewer' : 'admin';
    if (role !== 'admin') return;

    update(dbRef, {
        time,
        isActive,
        initialDuration,
        message,
        theme,
        plan,
        audienceQuestions,
    });
  }, [time, isActive, initialDuration, message, theme, plan, audienceQuestions, dbRef]);

  const addTimers = (quantity: number) => {
    const newExtraTimers = extraTimers + quantity;
    setExtraTimers(newExtraTimers);
    setInStorage('timerUsage', { used: timersUsed, extra: newExtraTimers, month: new Date().getMonth() });
  };
  
  const consumeTimerCredit = () => {
    if (timerLimit !== -1 && timersUsed >= timerLimit) {
        console.warn("Timer usage limit reached.");
        return;
    }
    const newUsage = timersUsed + 1;
    setTimersUsed(newUsage);
    setInStorage('timerUsage', { used: newUsage, extra: extraTimers, month: new Date().getMonth() });
    
    // Analytics update
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

    const newAnalytics = {
      ...analytics,
      totalTimers: newTotalTimers,
      avgDuration: newAvgDuration,
      durationBrackets: newBrackets,
    }
    setAnalytics(newAnalytics);
    setInStorage('timerAnalytics', newAnalytics);
  };

  const resetUsage = () => {
    setTimersUsed(0);
    setExtraTimers(0);
    setInStorage('timerUsage', { used: 0, extra: 0, month: new Date().getMonth() });
  };
  
  const resetAnalytics = () => {
    setAnalytics(initialAnalytics);
    setInStorage('timerAnalytics', initialAnalytics);
  }

  // Timer logic
  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isActive, time]);

  const toggleTimer = () => {
    if (!isActive) {
        consumeTimerCredit();
    }
    const newIsActive = !isActive;
    setIsActive(newIsActive); // Update local state immediately for responsiveness
    set(ref(db, `sessions/${sessionCode}/isActive`), newIsActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(initialDuration);
    set(ref(db, `sessions/${sessionCode}`), {
        time: initialDuration,
        isActive: false,
        initialDuration,
        message: null,
        theme,
        plan,
        audienceQuestions
    });
  };

  const setDuration = (duration: number) => {
    if (!isActive) {
      setInitialDuration(duration);
      setTime(duration);
      set(ref(db, `sessions/${sessionCode}/time`), duration);
      set(ref(db, `sessions/${sessionCode}/initialDuration`), duration);
    }
  };

  const sendMessage = (text: string) => {
    const newMessage = { id: Date.now(), text };
    setMessage(newMessage);
    set(ref(db, `sessions/${sessionCode}/message`), newMessage);

    const newAnalytics = {
      ...analytics,
      messagesSent: analytics.messagesSent + 1,
    };
    setAnalytics(newAnalytics);
    setInStorage('timerAnalytics', newAnalytics);
  };

  const dismissMessage = () => {
    setMessage(null);
    set(ref(db, `sessions/${sessionCode}/message`), null);
  };
  
  const setTheme = (newTheme: TimerTheme) => {
    setThemeState(newTheme);
    set(ref(db, `sessions/${sessionCode}/theme`), newTheme);
  };

  const setPlan = (newPlan: SubscriptionPlan) => {
    setPlanState(newPlan);
    set(ref(db, `sessions/${sessionCode}/plan`), newPlan);
  }

  const submitAudienceQuestion = (text: string) => {
    const newQuestion = { id: Date.now(), text };
    const newQuestions = [...audienceQuestions, newQuestion];
    setAudienceQuestions(newQuestions); // Optimistic update
    set(ref(db, `sessions/${sessionCode}/audienceQuestions`), newQuestions);
  };

  const dismissAudienceQuestion = (id: number) => {
    const filteredQuestions = audienceQuestions.filter(q => q.id !== id);
    setAudienceQuestions(filteredQuestions);
    set(ref(db, `sessions/${sessionCode}/audienceQuestions`), filteredQuestions);
  }

  const inviteTeamMember = (email: string, role: TeamMember['role']) => {
    const newMember: TeamMember = {
      name: 'Invited User', // Placeholder name
      email,
      role,
      status: 'Pending',
      avatar: `https://placehold.co/40x40.png`,
    };
    const newTeam = [...teamMembers, newMember];
    setTeamMembers(newTeam);
    setInStorage('teamMembers', newTeam);
  };

  const updateMemberStatus = (email: string, status: TeamMember['status']) => {
    const newTeam = teamMembers.map(member => 
      member.email === email ? { ...member, status } : member
    );
    setTeamMembers(newTeam);
    setInStorage('teamMembers', newTeam);
  };

  const value = {
    time,
    setTime,
    isActive,
    isFinished,
    toggleTimer,
    resetTimer,
    setDuration,
    message,
    sendMessage,
    dismissMessage,
    theme,
    setTheme,
    plan,
    setPlan,
    speakerDevices,
    participantDevices,
    timersUsed,
    timerLimit,
    consumeTimerCredit,
    resetUsage,
    addTimers,
    analytics,
    resetAnalytics,
    sessionCode,
    audienceQuestions,
    submitAudienceQuestion,
    dismissAudienceQuestion,
    teamMembers,
    inviteTeamMember,
    updateMemberStatus,
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
