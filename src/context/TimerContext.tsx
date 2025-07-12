
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
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User, type Auth } from "firebase/auth";
import { ref, onValue, set, update, off, get, getDatabase, type Database } from "firebase/database";
import type { FirebaseServices } from "@/lib/firebase";


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
  sessionCode: string | null;
  audienceQuestions: AudienceQuestion[];
  submitAudienceQuestion: (text: string) => void;
  dismissAudienceQuestion: (id: number) => void;
  teamMembers: TeamMember[];
  inviteTeamMember: (email: string, role: TeamMember['role']) => void;
  updateMemberStatus: (email: string, status: TeamMember['status']) => void;
  currentUser: User | null;
  loadingAuth: boolean;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  isSessionFound: boolean | null;
  firebaseServices: FirebaseServices | null;
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
];


const generateSessionCode = () => {
    // This function will only be called on the client, so it's safe to use Math.random
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Overload for the TimerProvider props
type TimerProviderProps = {
  children: React.ReactNode;
  // `sessionCode` is optional. If provided, the provider acts as a client.
  // If not provided, it acts as the host (admin dashboard).
  sessionCode?: string | null;
};


export const TimerProvider = ({ children, sessionCode: sessionCodeFromProps }: TimerProviderProps) => {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [initialDuration, setInitialDuration] = useState(900);
  const [time, setTime] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
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
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [isSessionFound, setIsSessionFound] = useState<boolean | null>(null);

  const isFinished = time === 0;

  useEffect(() => {
    // This effect runs only once on the client to initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        let app: FirebaseApp;
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        const auth = getAuth(app);
        const db = getDatabase(app);
        setFirebaseServices({ app, auth, db });
    } else {
        console.error("Firebase configuration is missing or invalid.");
        setLoadingAuth(false);
    }

    // Logic for setting the session code
    if (sessionCodeFromProps) {
        // If a code is passed via props, use it directly (for speaker/participant views)
        setSessionCode(sessionCodeFromProps);
    } else {
        // Otherwise, it's the admin dashboard, so get/create from localStorage
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
  }, [sessionCodeFromProps]);


  const baseTimerLimit = PLAN_LIMITS[plan];
  const timerLimit = baseTimerLimit === -1 ? -1 : baseTimerLimit + extraTimers;

  const dbRef = useMemo(() => {
    if (sessionCode && firebaseServices) {
      return ref(firebaseServices.db, `sessions/${sessionCode}`);
    }
    return null;
  }, [sessionCode, firebaseServices]);

  const isUpdatingFromDb = useRef(false);

  useEffect(() => {
    if (!firebaseServices) {
        setLoadingAuth(false);
        return;
    }
    const { auth } = firebaseServices;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {
        // Assign plan based on sign-up choice or demo email
        const selectedPlan = localStorage.getItem('selectedPlan') as SubscriptionPlan;
        if (selectedPlan) {
            setPlanState(selectedPlan);
            localStorage.removeItem('selectedPlan'); // Clean up after use
        } else if (user.email?.endsWith('@gmail.com')) {
          if (user.email.startsWith('pro')) setPlanState("Professional");
          else if (user.email.startsWith('starter')) setPlanState("Starter");
          else if (user.email.startsWith('enterprise')) setPlanState("Enterprise");
          else setPlanState("Freemium");
        } else {
            setPlanState("Freemium");
        }

        const userAsTeamMember: TeamMember = {
            name: "You",
            email: user.email!,
            role: "Admin",
            status: "Active",
            avatar: "https://placehold.co/40x40.png"
        };
        setTeamMembers(prev => {
            const userExists = prev.some(m => m.email === user.email);
            if (!userExists) return [userAsTeamMember, ...prev.filter(m => m.email !== "me@example.com")];
            return prev.map(m => m.email === user.email || m.email === 'me@example.com' ? userAsTeamMember : m);
        });

      } else {
        setTeamMembers(defaultTeam);
      }
    });

    return () => unsubscribe();
  }, [firebaseServices]);

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
    if (loadingAuth || !firebaseServices) return;
    const { used, extra } = getUsageFromStorage();
    setTimersUsed(used);
    setExtraTimers(extra);
    const analyticsKey = currentUser ? `timerAnalytics_${currentUser.uid}` : 'timerAnalytics_guest';
    const savedAnalytics = getFromStorage(analyticsKey, initialAnalytics);
    setAnalytics(savedAnalytics);
    const logoKey = currentUser ? `customLogo_${currentUser.uid}` : 'customLogo_guest';
    const savedLogo = getFromStorage(logoKey, null);
    if(savedLogo) setCustomLogoState(savedLogo);
  }, [currentUser, loadingAuth, firebaseServices, getUsageFromStorage]);

  // Firebase listener
  useEffect(() => {
    if (!dbRef) {
        if (sessionCodeFromProps && firebaseServices) {
            setIsSessionFound(false);
        }
        return;
    };
    const listener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setIsSessionFound(true);
            isUpdatingFromDb.current = true;
            setTime(data.time ?? initialDuration);
            setIsActive(data.isActive ?? false);
            setInitialDuration(data.initialDuration ?? 900);
            setMessage(data.message || null);
            setThemeState(data.theme || "Classic");
            setAudienceQuestions(data.audienceQuestions || []);
            setCustomLogoState(data.customLogo || null);

            const dbTeam = data.teamMembers || defaultTeam;
            if (currentUser) {
                const userExists = dbTeam.some((m: TeamMember) => m.email === currentUser.email);
                if (!userExists) {
                    dbTeam.push({ name: "You", email: currentUser.email!, role: "Admin", status: "Active", avatar: "https://placehold.co/40x40.png" });
                }
            }
            setTeamMembers(dbTeam);

            setSpeakerDevices(data.connections?.speakers || 0);
            setParticipantDevices(data.connections?.participants || 0);

            const dbPlan = data.plan || "Freemium";
            const selectedPlan = typeof window !== "undefined" ? localStorage.getItem('selectedPlan') : null;

            if (!selectedPlan && !(currentUser && currentUser.email?.endsWith('@gmail.com'))) {
               setPlanState(dbPlan);
            }

            isUpdatingFromDb.current = false;
        } else {
             // If we're a client (speaker/participant), this means the code is invalid.
             // If we're the host, it means we need to create it.
            if(sessionCodeFromProps){
                setIsSessionFound(false);
            } else {
                setIsSessionFound(true); // Host always "finds" the session
                const initialData = {
                    time: initialDuration,
                    isActive: false,
                    initialDuration: initialDuration,
                    message: null,
                    theme: "Classic",
                    plan: "Freemium",
                    audienceQuestions: [],
                    teamMembers: teamMembers,
                    customLogo: null,
                };
                if(dbRef) set(dbRef, initialData);
            }
        }
    });

    return () => {
        if(dbRef) off(dbRef, 'value', listener);
    };
  }, [dbRef, initialDuration, currentUser, firebaseServices, sessionCodeFromProps]);

  // Update DB on state change
  useEffect(() => {
    if (isUpdatingFromDb.current || !dbRef || !firebaseServices || sessionCodeFromProps ) return;

    // This logic should only run on the admin dashboard
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) return;

    update(dbRef, {
        time,
        isActive,
        initialDuration,
        message,
        plan,
        theme,
        audienceQuestions,
        teamMembers,
        customLogo,
    });
  }, [time, isActive, initialDuration, message, plan, theme, audienceQuestions, teamMembers, customLogo, dbRef, firebaseServices, sessionCodeFromProps]);

  const addTimers = (quantity: number) => {
    if (!currentUser) return;
    const newExtraTimers = extraTimers + quantity;
    setExtraTimers(newExtraTimers);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: timersUsed, extra: newExtraTimers, month: new Date().getMonth() });
  };

  const consumeTimerCredit = () => {
    if (!currentUser || (timerLimit !== -1 && timersUsed >= timerLimit)) {
      console.warn("Timer usage limit reached or no user.");
      return;
    }
    const newUsage = timersUsed + 1;
    setTimersUsed(newUsage);
    const usageKey = `timerUsage_${currentUser.uid}`;
    setInStorage(usageKey, { used: newUsage, extra: extraTimers, month: new Date().getMonth() });

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
    const analyticsKey = `timerAnalytics_${currentUser.uid}`;
    setInStorage(analyticsKey, newAnalytics);
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
    const analyticsKey = `timerAnalytics_${currentUser.uid}`;
    setInStorage(analyticsKey, initialAnalytics);
  }

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        // Only admin dashboard updates time to prevent multiple clients from decrementing
        if (!sessionCodeFromProps && dbRef) {
            setTime((prevTime) => prevTime - 1);
        }
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isActive, time, sessionCodeFromProps, dbRef]);

  const toggleTimer = () => {
    if (!dbRef || !firebaseServices) return;
    if (!isActive) {
      if (timerLimit !== -1 && timersUsed >= timerLimit) {
        return;
      }
      consumeTimerCredit();
    }
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/isActive`), newIsActive);
  };

  const resetTimer = () => {
    if (!dbRef || !firebaseServices) return;
    setIsActive(false);
    setTime(initialDuration);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/time`), initialDuration);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/isActive`), false);
  };

  const setDuration = (duration: number) => {
    if (!dbRef || isActive || !firebaseServices) return;
    setInitialDuration(duration);
    setTime(duration);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/time`), duration);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/initialDuration`), duration);
  };

  const sendMessage = (text: string) => {
    if (!dbRef || !firebaseServices) {
      throw new Error("Database connection not available.");
    }
    const newMessage = { id: Date.now(), text };
    setMessage(newMessage);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/message`), newMessage);

    const newAnalytics = {
      ...analytics,
      messagesSent: analytics.messagesSent + 1,
    };
    setAnalytics(newAnalytics);
    const analyticsKey = currentUser ? `timerAnalytics_${currentUser.uid}` : 'timerAnalytics_guest';
    setInStorage(analyticsKey, newAnalytics);
  };

  const dismissMessage = () => {
    if (!dbRef || !firebaseServices) return;
    setMessage(null);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/message`), null);
  };

  const setTheme = (newTheme: TimerTheme) => {
    if (!dbRef || !firebaseServices) return;
    setThemeState(newTheme);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/theme`), newTheme);
  };

  const setPlan = (newPlan: SubscriptionPlan) => {
    if (!dbRef || !firebaseServices) return;
    setPlanState(newPlan);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/plan`), newPlan);
  }

  const setCustomLogo = (logo: string | null) => {
    if (!dbRef || !firebaseServices) return;
    setCustomLogoState(logo);
    const logoKey = currentUser ? `customLogo_${currentUser.uid}` : 'customLogo_guest';
    setInStorage(logoKey, logo);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/customLogo`), logo);
  }

  const submitAudienceQuestion = (text: string) => {
    if (!dbRef || !firebaseServices) return;
    // We get the latest questions from DB to prevent race conditions
    get(ref(firebaseServices.db, `sessions/${sessionCode}/audienceQuestions`)).then(snapshot => {
        const currentQuestions = snapshot.val() || [];
        const newQuestion = { id: Date.now(), text };
        const newQuestions = [...currentQuestions, newQuestion];
        set(ref(dbRef, 'audienceQuestions'), newQuestions);
    });
  };

  const dismissAudienceQuestion = (id: number) => {
    if (!dbRef || !firebaseServices) return;
    const filteredQuestions = audienceQuestions.filter(q => q.id !== id);
    setAudienceQuestions(filteredQuestions);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/audienceQuestions`), filteredQuestions);
  }

  const inviteTeamMember = (email: string, role: TeamMember['role']) => {
    if (!dbRef || !firebaseServices) return;
    if (plan === 'Freemium' && role === 'Admin') {
        console.error("Freemium plan cannot have more than one Admin.");
        return;
    }
    const newMember: TeamMember = {
      name: 'Invited User',
      email,
      role,
      status: 'Pending',
      avatar: `https://placehold.co/40x40.png`,
    };
    const newTeam = [...teamMembers, newMember];
    setTeamMembers(newTeam);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/teamMembers`), newTeam);
  };

  const updateMemberStatus = (email: string, status: TeamMember['status']) => {
    if (!dbRef || !firebaseServices) return;
    const newTeam = teamMembers.map(member =>
      member.email === email ? { ...member, status } : member
    );
    setTeamMembers(newTeam);
    set(ref(firebaseServices.db, `sessions/${sessionCode}/teamMembers`), newTeam);
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
    currentUser,
    loadingAuth,
    customLogo,
    setCustomLogo,
    isSessionFound,
    firebaseServices,
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
