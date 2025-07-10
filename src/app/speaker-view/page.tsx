
"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export default function SpeakerViewPage() {
  const { time, isFinished, message, dismissMessage, theme } = useTimer();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const themeClasses = {
    Classic: {
      bg: "bg-black text-white",
      time: "font-mono",
      warningBg: "bg-yellow-600",
      urgentBg: "bg-orange-700",
      finishedBg: "bg-red-800",
    },
    Modern: {
      bg: "bg-gray-900 text-white",
      time: "font-headline tracking-wide",
      warningBg: "bg-blue-800",
      urgentBg: "bg-purple-800",
      finishedBg: "bg-red-900",
    },
    Minimalist: {
      bg: "bg-gray-100 text-gray-800",
      time: "font-sans font-light",
      warningBg: "bg-yellow-200",
      urgentBg: "bg-orange-200",
      finishedBg: "bg-red-200",
    },
    Industrial: {
      bg: "bg-gray-800 text-gray-200",
      time: "font-mono uppercase",
      warningBg: "bg-yellow-800/50",
      urgentBg: "bg-orange-800/60",
      finishedBg: "bg-red-800/70",
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.Classic;

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen flex-col items-center justify-center transition-colors duration-500",
        currentTheme.bg,
        {
          [currentTheme.warningBg]: !isFinished && time <= 300 && time > 180, // 5-3 minute warning
          [currentTheme.urgentBg]: !isFinished && time <= 180 && time > 0, // 3-0 minute warning
          [currentTheme.finishedBg]: isFinished,
        }
      )}
    >
      <div
        className={cn(
          "font-bold",
          currentTheme.time
        )}
        style={{ fontSize: "clamp(5rem, 25vw, 20rem)", lineHeight: 1 }}
      >
        {formatTime(time)}
      </div>

      {message && (
        <div className="absolute bottom-10 left-10 right-10 z-10 mx-auto max-w-4xl animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
           <Alert variant="default" className="bg-background/90 text-foreground shadow-2xl backdrop-blur-sm">
             <MessageSquare className="h-6 w-6" />
             <AlertTitle className="text-xl font-bold">
                Message from Admin
             </AlertTitle>
             <AlertDescription className="text-lg">
                {message.text}
             </AlertDescription>
             <button onClick={dismissMessage} className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted">
                <X className="h-5 w-5"/>
             </button>
           </Alert>
        </div>
      )}
    </div>
  );
}
