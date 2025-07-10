"use client";

import React, { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, X } from "lucide-react";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export default function SpeakerViewPage() {
  const { time, isFinished, message, dismissMessage } = useTimer();

  useEffect(() => {
    // Attempt to enter fullscreen on component mount
    // document.documentElement.requestFullscreen().catch((err) => {
    //   console.error(
    //     `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
    //   );
    // });
    
    // Hide scrollbars for a cleaner look
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen flex-col items-center justify-center bg-black text-white transition-colors duration-500",
        {
          "bg-red-800": isFinished,
          "bg-yellow-600": !isFinished && time <= 300 && time > 0, // 5 minute warning
        }
      )}
    >
      <div
        className="font-mono font-bold"
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
