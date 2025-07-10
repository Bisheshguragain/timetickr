"use client";

import React, { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export default function SpeakerViewPage() {
  const { time, isFinished } = useTimer();

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
        "flex h-screen w-screen flex-col items-center justify-center bg-black text-white transition-colors duration-500",
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
    </div>
  );
}
