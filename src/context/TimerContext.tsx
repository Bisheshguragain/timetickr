
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";

interface Message {
  id: number;
  text: string;
}

export type TimerTheme = "Classic" | "Modern" | "Minimalist" | "Industrial";
export type SubscriptionPlan = "Freemium" | "Starter" | "Professional" | "Enterprise";

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
  connectedDevices: number;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "timer_channel";

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialDuration, setInitialDuration] = useState(900);
  const [time, setTime] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<Message | null>({ id: 1, text: "This is a sample message in Classic theme." });
  const [theme, setThemeState] = useState<TimerTheme>("Classic");
  const [plan, setPlanState] = useState<SubscriptionPlan>("Professional"); // Default plan for demo
  const [connectedDevices, setConnectedDevices] = useState(0);
  const isFinished = time === 0;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const clientId = useRef<string | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectedClients = useRef(new Set<string>());

  // Initialize Broadcast Channel and Client ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
        clientId.current = Math.random().toString(36).substring(7);
        channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    
        const handleMessage = (event: MessageEvent) => {
          const { type, payload, senderId } = event.data;
          
          if(senderId === clientId.current) return;

          switch (type) {
            case "SET_STATE":
              setTime(payload.time);
              setIsActive(payload.isActive);
              setInitialDuration(payload.initialDuration);
              setMessage(payload.message);
              setThemeState(payload.theme);
              setPlanState(payload.plan);
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
                channelRef.current?.postMessage({ type: "PONG", senderId: clientId.current });
                break;
            case "PONG":
                connectedClients.current.add(senderId);
                setConnectedDevices(connectedClients.current.size);
                break;
            case "REQUEST_STATE":
                if (clientId.current) { // Only existing tabs should respond
                    channelRef.current?.postMessage({
                        type: 'SET_STATE',
                        payload: { time, isActive, initialDuration, message, theme, plan },
                        senderId: clientId.current
                    });
                }
                break;
          }
        };
        
        channelRef.current.addEventListener("message", handleMessage);

        // Announce presence and request state from other tabs when a new tab joins
        channelRef.current.postMessage({ type: "REQUEST_STATE", senderId: clientId.current });
        
        // Ping to discover other clients
        const ping = () => {
            connectedClients.current.clear();
            if(clientId.current) connectedClients.current.add(clientId.current); // Add self
            setConnectedDevices(connectedClients.current.size);
            channelRef.current?.postMessage({ type: "PING", senderId: clientId.current });
            
            // After a short delay, update the count based on responses
            if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
            pingTimeoutRef.current = setTimeout(() => {
                setConnectedDevices(connectedClients.current.size);
            }, 500);
        };
        
        ping(); // Initial ping
        const pingInterval = setInterval(ping, 5000); // Ping every 5 seconds

        return () => {
          channelRef.current?.removeEventListener("message", handleMessage);
          channelRef.current?.close();
          clearInterval(pingInterval);
          if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        };
    }
  }, [time, isActive, initialDuration, message, theme, plan]);


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
    broadcastAction({
      type: "SET_STATE",
      payload: { time, isActive, initialDuration, message, theme, plan },
    });
  }, [time, isActive, initialDuration, message, theme, plan, broadcastAction]);


  const toggleTimer = () => {
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
    setPlanState(newPlan);
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
    connectedDevices,
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
