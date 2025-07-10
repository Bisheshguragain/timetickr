"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
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
    <section className="relative overflow-hidden py-20 md:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/30" />
      </div>
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-headline text-primary">
            Never miss a cue again
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The Ultimate Stage Timer for Flawless Presentations
          </h1>
          <p className="mt-6 text-lg text-foreground/80">
            Control countdown timers from any device while your speakers see a clean, distraction-free display.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button asChild size="lg">
              <Link href="#pricing">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#contact">Request a Demo</Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 mx-auto max-w-3xl rounded-lg border bg-card/50 backdrop-blur-sm p-8 shadow-2xl shadow-primary/10">
          <div className={cn("font-mono text-center text-7xl md:text-8xl font-bold tracking-tighter", time < 60 && time > 0 ? "text-destructive" : "text-foreground")}>
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
    </section>
  );
}
