
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, ArrowRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  const [time, setTime] = useState(900); // 15 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [theme, setTheme] = useState<'Classic' | 'Modern' | 'Minimalist' | 'Industrial'>('Classic');
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
    setTime(900);
  };

  const changeTime = (amount: number) => {
    if (!isActive) {
      setTime(prevTime => Math.max(0, prevTime + amount));
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const themes = ['Classic', 'Modern', 'Minimalist', 'Industrial'] as const;

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_500px_at_50%_200px,#c7158540,#8a2be230,transparent)]"></div>
      </div>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Professional Event Timers for Flawless Presentations
              </h1>
              <p className="mt-6 text-lg text-foreground/80">
                TimeTickR helps event professionals manage time effectively with beautiful, customizable countdown timers that work seamlessly across all devices.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <Button asChild size="lg">
                  <Link href="#pricing">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className={cn(
                "w-full max-w-md rounded-2xl p-8 transition-all duration-300 border shadow-2xl shadow-primary/10",
                {
                  'Classic': "bg-card/50 backdrop-blur-sm",
                  'Modern': "border-primary/20 bg-primary/5 shadow-primary/20",
                  'Minimalist': "border-dashed border-border/50 bg-background/50",
                  'Industrial': "bg-secondary/40 border-muted"
                }[theme]
              )}>
                <p className={cn(
                  "text-center font-medium",
                  {
                    'Classic': 'text-foreground/80',
                    'Modern': 'text-primary font-semibold',
                    'Minimalist': 'text-muted-foreground',
                    'Industrial': 'text-foreground/90 font-bold tracking-wider uppercase'
                  }[theme]
                )}>Live Timer Demo</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="ghost" size="icon" onClick={() => changeTime(-60)} disabled={isActive}>
                    <Minus />
                  </Button>
                  <div className={cn(
                    "font-mono text-center text-6xl md:text-7xl font-bold tracking-tighter transition-colors", 
                    time < 60 && time > 0 ? "text-destructive" : "",
                    {
                      'Modern': 'text-primary',
                      'Industrial': 'font-code text-foreground',
                      'Classic': 'text-foreground',
                      'Minimalist': 'text-foreground/80'
                    }[theme]
                  )}>
                    {formatTime(time)}
                  </div>
                   <Button variant="ghost" size="icon" onClick={() => changeTime(60)} disabled={isActive}>
                    <Plus />
                  </Button>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Button onClick={toggleTimer} size="lg">
                    {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                    {isActive ? "Pause" : "Start"}
                  </Button>
                  <Button onClick={resetTimer} size="lg" variant="secondary">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </div>
                <div className="mt-6 flex justify-center flex-wrap gap-2">
                    {themes.map((t) => (
                         <Button 
                            key={t}
                            variant={theme === t ? "default" : "secondary"}
                            size="sm" 
                            onClick={() => setTheme(t)}
                            className={cn(
                                "transition-all",
                                theme === t ? "shadow-md" : "bg-secondary/50",
                                {'Industrial': theme === t ? 'bg-foreground text-background' : 'border-muted'}[theme === 'Industrial' ? 'Industrial' : '']
                            )}
                         >
                            {t}
                         </Button>
                    ))}
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
