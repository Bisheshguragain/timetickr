
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Timer,
  Settings,
  MonitorPlay,
  MessageSquare,
  Send,
  Loader,
  Palette,
  Check,
} from "lucide-react";
import { useTimer, TimerTheme } from "@/context/TimerContext";
import { Header } from "@/components/landing/header";
import { moderateMessage } from "@/ai/flows/moderate-message";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function LiveMessagingCard() {
    const { sendMessage } = useTimer();
    const { toast } = useToast();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);


    const presetMessages = [
        "5 minutes remaining",
        "2 minutes remaining",
        "Please wrap up",
        "Time is up!",
        "Great job!",
        "Q&A starting now",
    ];

    const handleSend = async (messageToSend: string) => {
        if (!messageToSend) return;
        setIsLoading(true);
        setLoadingMessage(messageToSend);
        try {
            const moderationResult = await moderateMessage({ message: messageToSend });
            if (moderationResult.isSafe) {
                sendMessage(messageToSend);
                setMessage("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Message Blocked",
                    description: `Reason: ${moderationResult.reason}`,
                });
            }
        } catch (error) {
            console.error("Error moderating message:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send message. Please try again.",
            });
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare />
                    Live Messaging
                </CardTitle>
                <CardDescription>
                    Send messages directly to the speaker's display. Messages are moderated by AI.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Textarea 
                        placeholder="Type your custom message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(message.trim());
                            }
                        }}
                        disabled={isLoading}
                    />
                    <Button onClick={() => handleSend(message.trim())} className="w-full" disabled={isLoading || !message.trim()}>
                        {isLoading && loadingMessage === message.trim() ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                        {isLoading && loadingMessage === message.trim() ? "Analyzing..." : "Send Custom Message"}
                    </Button>
                </div>
                 <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Quick Messages
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {presetMessages.map((msg) => (
                            <Button
                                key={msg}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSend(msg)}
                                disabled={isLoading}
                                className="flex-grow"
                            >
                                {isLoading && loadingMessage === msg ? <Loader className="mr-2 animate-spin" /> : null}
                                {msg}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ThemeSelectorCard() {
  const { theme, setTheme } = useTimer();
  const themes: { name: TimerTheme; bg: string; text: string; time: string; }[] = [
    { name: "Classic", bg: "bg-black", text: "text-white", time: "font-mono" },
    { name: "Modern", bg: "bg-gray-900", text: "text-white", time: "font-headline tracking-wide" },
    { name: "Minimalist", bg: "bg-gray-100", text: "text-gray-800", time: "font-sans font-light" },
    { name: "Industrial", bg: "bg-gray-800", text: "text-gray-200", time: "font-mono uppercase" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette />
          Theme Selector
        </CardTitle>
        <CardDescription>
          Choose a visual theme for the speaker's display.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.name}
            className={cn(
              "relative aspect-video rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer transition-all duration-200 border-2",
              t.bg,
              theme === t.name ? "border-primary" : "border-transparent"
            )}
            onClick={() => setTheme(t.name)}
          >
            <div className={cn("text-2xl font-bold", t.time, t.text)}>
              01:23
            </div>
            <div className={cn("text-xs mt-1", t.text)}>
              {t.name}
            </div>
            {theme === t.name && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    time,
    isActive,
    toggleTimer,
    resetTimer,
    setDuration,
  } = useTimer();

  const handleSetTime = (newTime: number) => {
    const clampedTime = Math.max(0, newTime);
    if (!isActive) {
      setDuration(clampedTime);
    }
  };

  const presetDurations = [300, 600, 900, 1800, 3600];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <Button asChild variant="outline">
              <Link href="/speaker-view" target="_blank">
                <MonitorPlay className="mr-2" />
                Open Speaker View
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer />
                  Live Timer Control
                </CardTitle>
                <CardDescription>
                  Manage the countdown timer that your speaker sees in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
                <div className="font-mono text-8xl font-bold tracking-tighter md:text-9xl">
                  {formatTime(time)}
                </div>
                <div className="flex w-full max-w-sm items-center justify-center space-x-4">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="w-full"
                  >
                    {isActive ? (
                      <Pause className="mr-2" />
                    ) : (
                      <Play className="mr-2" />
                    )}
                    {isActive ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={() => resetTimer()}
                    size="lg"
                    variant="secondary"
                    className="w-full"
                  >
                    <RotateCcw className="mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Settings />
                    Timer Settings
                    </CardTitle>
                    <CardDescription>
                    Configure the timer duration before starting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                    <label
                        htmlFor="custom-time"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                        Custom Duration (in minutes)
                    </label>
                    <div className="flex items-center gap-2">
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSetTime(time - 60)}
                        disabled={isActive}
                        >
                        <Minus />
                        </Button>
                        <Input
                        id="custom-time"
                        type="number"
                        className="text-center"
                        value={Math.floor(time / 60)}
                        onChange={(e) =>
                            handleSetTime(parseInt(e.target.value) * 60)
                        }
                        onFocus={(e) => e.target.select()}
                        disabled={isActive}
                        />
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSetTime(time + 60)}
                        disabled={isActive}
                        >
                        <Plus />
                        </Button>
                    </div>
                    </div>

                    <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Preset Durations
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {presetDurations.map((duration) => (
                        <Button
                            key={duration}
                            variant="outline"
                            onClick={() => handleSetTime(duration)}
                            disabled={isActive}
                        >
                            {duration / 60} min
                        </Button>
                        ))}
                    </div>
                    </div>
                </CardContent>
                </Card>
                <ThemeSelectorCard />
                <LiveMessagingCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    