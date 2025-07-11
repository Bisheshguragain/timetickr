
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

interface Message {
  id: number;
  text: string;
}

export interface AudienceQuestion {
    id: number;
    text: string;
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
  speakerPairingCode: string;
  audiencePairingCode: string;
  audienceQuestions: AudienceQuestion[];
  submitAudienceQuestion: (text: string) => void;
  dismissAudienceQuestion: (id: number) => void;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "timer_channel";

const initialAnalytics: AnalyticsData = {
    totalTimers: 0,
    avgDuration: 0,
    messagesSent: 0,
    maxSpeakers: 0,
    maxAudience: 0,
    durationBrackets: { "0-5": 0, "5-15": 0, "15-30": 0, "30-60": 0, "60+": 0 },
};

const generatePairingCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const getOrCreateCode = (key: string) => {
    if (typeof window === 'undefined') return '';
    let code = localStorage.getItem(key);
    if (!code) {
        code = generatePairingCode();
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
  const isFinished = time === 0;

  const speakerPairingCode = useMemo(() => getOrCreateCode('speakerPairingCode'), []);
  const audiencePairingCode = useMemo(() => getOrCreateCode('audiencePairingCode'), []);

  const baseTimerLimit = PLAN_LIMITS[plan];
  const timerLimit = baseTimerLimit === -1 ? -1 : baseTimerLimit + extraTimers;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const clientId = useRef<string | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectedClients = useRef(new Map<string, string>());
  const clientRole = useRef<'speaker' | 'participant' | 'admin'>('admin');


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
  }, []);

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

  // Initialize Broadcast Channel and Client ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        let code: string | null = null;
        let isValid = false;

        if (window.location.pathname.includes('/speaker-view')) {
            code = urlParams.get('code');
            clientRole.current = 'speaker';
            isValid = code === speakerPairingCode;
        } else if (window.location.pathname.includes('/participant')) {
            code = urlParams.get('code');
            clientRole.current = 'participant';
            isValid = code === audiencePairingCode;
        } else {
            clientRole.current = 'admin';
            isValid = true;
        }
        
        if (!isValid) return;

        clientId.current = Math.random().toString(36).substring(7);
        channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    
        const handleMessage = (event: MessageEvent) => {
          const { type, payload, senderId, role } = event.data;
          
          if(senderId === clientId.current) return;

          switch (type) {
            case "SET_STATE":
              setTime(payload.time);
              setIsActive(payload.isActive);
              setInitialDuration(payload.initialDuration);
              setMessage(payload.message);
              setThemeState(payload.theme);
              setPlanState(payload.plan);
              setAudienceQuestions(payload.audienceQuestions);
              break;
            case "SUBMIT_QUESTION":
                const newQuestions = [...audienceQuestions, payload.question];
                setAudienceQuestions(newQuestions);
                setInStorage('audienceQuestions', newQuestions);
                break;
            case "DISMISS_QUESTION":
                const filteredQuestions = audienceQuestions.filter(q => q.id !== payload.id);
                setAudienceQuestions(filteredQuestions);
                setInStorage('audienceQuestions', filteredQuestions);
                break;
            case "TOGGLE":
              setIsActive((prev) => !prev);
              break;
            case "RESET":
              setIsActive(false);
              setTime(payload.initialDuration);
              break;
            case "SET_DURATION":
              if (!isActive) {
                 setInitialDuration(payload.duration);
                 setTime(payload.duration);
              }
              break;
            case "SEND_MESSAGE":
                setMessage(payload.message);
                break;
            case "DISMISS_MESSAGE":
                setMessage(null);
                break;
            case "SET_THEME":
                setThemeState(payload.theme);
                break;
            case "SET_PLAN":
                setPlanState(payload.plan);
                break;
            case "PING":
                channelRef.current?.postMessage({ type: "PONG", senderId: clientId.current, role: clientRole.current });
                break;
            case "PONG":
                connectedClients.current.set(senderId, role);
                break;
            case "REQUEST_STATE":
                if (clientId.current && clientRole.current === 'admin') { 
                    channelRef.current?.postMessage({
                        type: 'SET_STATE',
                        payload: { time, isActive, initialDuration, message, theme, plan, audienceQuestions },
                        senderId: clientId.current
                    });
                }
                break;
          }
        };
        
        channelRef.current.addEventListener("message", handleMessage);
        channelRef.current.postMessage({ type: "REQUEST_STATE", senderId: clientId.current });
        
        const updateDeviceCounts = () => {
            let speakers = 0;
            let participants = 0;
            connectedClients.current.forEach((role) => {
                if (role === 'speaker') speakers++;
                else if (role === 'participant') participants++;
            });
            setSpeakerDevices(speakers);
            setParticipantDevices(participants);

            // Update peak analytics
            if (speakers > analytics.maxSpeakers || participants > analytics.maxAudience) {
                const newAnalytics = {
                    ...analytics,
                    maxSpeakers: Math.max(analytics.maxSpeakers, speakers),
                    maxAudience: Math.max(analytics.maxAudience, participants),
                };
                setAnalytics(newAnalytics);
                setInStorage('timerAnalytics', newAnalytics);
            }
        };

        const ping = () => {
            connectedClients.current.clear();
            if(clientId.current) connectedClients.current.set(clientId.current, clientRole.current);
            
            channelRef.current?.postMessage({ type: "PING", senderId: clientId.current, role: clientRole.current });
            
            if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
            pingTimeoutRef.current = setTimeout(() => {
                updateDeviceCounts();
            }, 500); 
        };
        
        ping(); 
        const pingInterval = setInterval(ping, 5000); 

        return () => {
          channelRef.current?.removeEventListener("message", handleMessage);
          channelRef.current?.close();
          clearInterval(pingInterval);
          if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        };
    }
  }, [time, isActive, initialDuration, message, theme, plan, speakerPairingCode, audiencePairingCode, audienceQuestions, analytics]);


  const broadcastAction = useCallback((action: any) => {
    channelRef.current?.postMessage({ ...action, senderId: clientId.current });
  }, []);

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
  
  // Effect to broadcast state changes
  useEffect(() => {
    if (clientRole.current === 'admin') {
      broadcastAction({
        type: "SET_STATE",
        payload: { time, isActive, initialDuration, message, theme, plan, audienceQuestions },
      });
    }
  }, [time, isActive, initialDuration, message, theme, plan, audienceQuestions, broadcastAction]);


  const toggleTimer = () => {
    if (!isActive) {
        consumeTimerCredit();
    }
    broadcastAction({ type: "TOGGLE" });
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    broadcastAction({ type: "RESET", payload: { initialDuration } });
    setIsActive(false);
    setTime(initialDuration);
  };

  const setDuration = (duration: number) => {
    if (!isActive) {
      broadcastAction({ type: "SET_DURATION", payload: { duration } });
      setInitialDuration(duration);
      setTime(duration);
    }
  };

  const sendMessage = (text: string) => {
    const newMessage = { id: Date.now(), text };
    broadcastAction({ type: "SEND_MESSAGE", payload: { message: newMessage }});
    setMessage(newMessage);

    const newAnalytics = {
      ...analytics,
      messagesSent: analytics.messagesSent + 1,
    };
    setAnalytics(newAnalytics);
    setInStorage('timerAnalytics', newAnalytics);
  };

  const dismissMessage = () => {
    broadcastAction({ type: "DISMISS_MESSAGE" });
    setMessage(null);
  };
  
  const setTheme = (newTheme: TimerTheme) => {
    broadcastAction({ type: "SET_THEME", payload: { theme: newTheme } });
    setThemeState(newTheme);
  };

  const setPlan = (newPlan: SubscriptionPlan) => {
    broadcastAction({ type: "SET_PLAN", payload: { plan: newPlan } });
  }

  const submitAudienceQuestion = (text: string) => {
    const newQuestion = { id: Date.now(), text };
    broadcastAction({ type: 'SUBMIT_QUESTION', payload: { question: newQuestion } });
    const newQuestions = [...audienceQuestions, newQuestion];
    setAudienceQuestions(newQuestions);
    setInStorage('audienceQuestions', newQuestions);
  };

  const dismissAudienceQuestion = (id: number) => {
    broadcastAction({ type: 'DISMISS_QUESTION', payload: { id } });
    const filteredQuestions = audienceQuestions.filter(q => q.id !== id);
    setAudienceQuestions(filteredQuestions);
    setInStorage('audienceQuestions', filteredQuestions);
  }

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
    speakerPairingCode,
    audiencePairingCode,
    audienceQuestions,
    submitAudienceQuestion,
    dismissAudienceQuestion,
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

    