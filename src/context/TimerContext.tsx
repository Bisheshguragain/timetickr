
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
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "timer_channel";

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialDuration, setInitialDuration] = useState(900);
  const [time, setTime] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [theme, setThemeState] = useState<TimerTheme>("Classic");
  const isFinished = time === 0;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize Broadcast Channel
  useEffect(() => {
    channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case "SET_STATE":
          setTime(payload.time);
          setIsActive(payload.isActive);
          setInitialDuration(payload.initialDuration);
          setMessage(payload.message);
          setThemeState(payload.theme);
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
        default:
          break;
      }
    };
    
    channelRef.current.addEventListener("message", handleMessage);

    // Request initial state from other tabs when a new tab joins
    channelRef.current.postMessage({ type: "REQUEST_STATE" });
    
    // Respond to state requests
    const respondToStateRequest = (event: MessageEvent) => {
        if (event.data.type === 'REQUEST_STATE') {
            channelRef.current?.postMessage({
                type: 'SET_STATE',
                payload: { time, isActive, initialDuration, message, theme },
            });
        }
    };
    channelRef.current.addEventListener('message', respondToStateRequest);


    return () => {
      channelRef.current?.removeEventListener("message", handleMessage);
      channelRef.current?.removeEventListener('message', respondToStateRequest);
      channelRef.current?.close();
    };
  }, [time, isActive, initialDuration, message, theme]);


  const broadcastState = useCallback(() => {
    channelRef.current?.postMessage({
      type: "SET_STATE",
      payload: { time, isActive, initialDuration, message, theme },
    });
  }, [time, isActive, initialDuration, message, theme]);

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
    broadcastState();
  }, [time, isActive, initialDuration, message, theme, broadcastState]);


  const toggleTimer = () => {
    channelRef.current?.postMessage({ type: "TOGGLE" });
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    channelRef.current?.postMessage({ type: "RESET", payload: { initialDuration } });
    setIsActive(false);
    setTime(initialDuration);
  };

  const setDuration = (duration: number) => {
    if (!isActive) {
      channelRef.current?.postMessage({ type: "SET_DURATION", payload: { duration } });
      setInitialDuration(duration);
      setTime(duration);
    }
  };

  const sendMessage = (text: string) => {
    const newMessage = { id: Date.now(), text };
    channelRef.current?.postMessage({ type: "SEND_MESSAGE", payload: { message: newMessage }});
    setMessage(newMessage);
  };

  const dismissMessage = () => {
    channelRef.current?.postMessage({ type: "DISMISS_MESSAGE" });
    setMessage(null);
  };
  
  const setTheme = (newTheme: TimerTheme) => {
    channelRef.current?.postMessage({ type: "SET_THEME", payload: { theme: newTheme } });
    setThemeState(newTheme);
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
    setTheme
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

    