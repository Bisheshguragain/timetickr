"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function TimerDemo() {
  const [time, setTime] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isActive || time === 0) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      if(time === 0) setIsActive(false);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isActive, time]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(300);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Experience the Timer
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          A glimpse of our clean, distraction-free speaker display.
        </p>
      </div>
      <div className="mt-16 mx-auto max-w-3xl rounded-lg border bg-card p-8 shadow-2xl shadow-primary/10">
        <div className={cn("font-mono text-center text-7xl md:text-9xl font-bold tracking-tighter", time < 60 && time > 0 ? "text-destructive" : "text-foreground")}>
          {formatTime(time)}
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-36">
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button onClick={resetTimer} size="lg" variant="secondary" className="w-36">
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
