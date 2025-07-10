
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Signal,
  Star,
  ArrowRight,
  RefreshCcw,
  ShoppingCart,
  BarChartHorizontal,
  FileClock,
} from "lucide-react";
import { useTimer, TimerTheme } from "@/context/TimerContext";
import { Header } from "@/components/landing/header";
import { moderateMessage } from "@/ai/flows/moderate-message";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateAlerts, GenerateAlertsOutput } from "@/ai/flows/generate-alerts-flow";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function LiveMessagingCard() {
    const { sendMessage, analytics } = useTimer();
    const { toast } = useToast();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);


    const presetMessages = [
        "5 minutes remaining",
        "3 minutes remaining",
        "1 minute left",
        "Time is up!",
        "Q&A starting now",
        "Please wrap up",
        "You're doing great!",
        "Amazing energy!",
        "The audience is loving this!",
        "Technical difficulties, please stand by.",
        "Mic is off.",
        "Let's welcome our next speaker!",
        "Thank you for that insightful presentation!",
        "Incredible work!",
        "Fantastic point!",
        "Keep the energy high!",
        "Powerful message.",
    ];

    const presetEmojis = ["👍", "❤️", "😂", "👏", "🤯", "🔥"];

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
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Quick Emojis
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {presetEmojis.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="outline"
                                size="icon"
                                onClick={() => handleSend(emoji)}
                                disabled={isLoading}
                                className="text-xl"
                            >
                                {isLoading && loadingMessage === emoji ? <Loader className="animate-spin" /> : emoji}
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
    { name: "Classic", bg: "bg-gray-800", text: "text-white", time: "font-mono" },
    { name: "Modern", bg: "bg-gray-900", text: "text-white", time: "font-headline tracking-wide" },
    { name: "Minimalist", bg: "bg-gray-100", text: "text-gray-800", time: "font-sans font-light border-2 border-gray-200" },
    { name: "Industrial", bg: "bg-gray-800", text: "text-amber-400", time: "font-mono uppercase" },
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
            <div className={cn("text-xs mt-1", t.text === 'text-white' || t.text === 'text-amber-400' ? t.text : 'text-gray-500')}>
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

function ConnectedDevicesCard() {
  const { connectedDevices } = useTimer();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signal />
          Connected Devices
        </CardTitle>
        <CardDescription>
          Number of speaker displays currently active.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
          <span className="text-4xl font-bold text-primary">{connectedDevices}</span>
          <svg className="absolute h-full w-full" viewBox="0 0 36 36">
              <circle
              className="text-primary/20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              cx="18"
              cy="18"
              r="16"
              />
          </svg>
        </div>
        <p className="text-lg font-medium text-muted-foreground">{connectedDevices === 1 ? 'Device' : 'Devices'} Online</p>
      </CardContent>
    </Card>
  );
}

function CurrentPlanCard() {
  const { plan, timersUsed, timerLimit, resetUsage } = useTimer();

  const planDetails = {
    Freemium: { name: "Freemium", description: "Get started with our basic features." },
    Starter: { name: "Starter", description: "Unlock more features for small teams." },
    Professional: { name: "Professional", description: "Power features for growing businesses." },
    Enterprise: { name: "Enterprise", description: "You have access to all our top-tier features." },
  };

  const currentPlanDetails = planDetails[plan];
  const usagePercentage = timerLimit > 0 ? (timersUsed / timerLimit) * 100 : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star />
                Current Plan
            </div>
             <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{currentPlanDetails.name}</span>
        </CardTitle>
        <CardDescription>
          {currentPlanDetails.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div>
            <div className="flex justify-between items-center mb-2 text-sm font-medium text-muted-foreground">
                <span>Monthly Usage</span>
                {plan === 'Enterprise' ? (
                    <span>Unlimited Timers</span>
                ) : (
                    <span>
                        <span className="text-foreground font-bold">{timersUsed}</span> / {timerLimit} Timers
                    </span>
                )}
            </div>
            <Progress value={usagePercentage} />
         </div>
         <Button onClick={resetUsage} variant="link" size="sm" className="p-0 h-auto text-muted-foreground">
            <RefreshCcw className="mr-2" /> Reset usage for demo
         </Button>
      </CardContent>
      {plan !== 'Enterprise' && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/#pricing">Upgrade Plan <ArrowRight className="ml-2" /></Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function PurchaseTimersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpencha: (open: boolean) => void;
}) {
  const { addTimers } = useTimer();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const pricePerTimer = 2;
  const totalCost = quantity * pricePerTimer;

  const handlePurchase = () => {
    addTimers(quantity);
    toast({
      title: "Purchase Successful!",
      description: `You've successfully added ${quantity} timer(s) to your account.`,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart />
            Need More Timers?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You've reached your monthly limit. Purchase additional timers to
            continue. Each timer costs £{pricePerTimer}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus />
            </Button>
            <span className="text-4xl font-bold w-20 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-center text-lg font-semibold">
            Total Cost: £{totalCost}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePurchase}>
            Complete Purchase
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AnalyticsCard() {
    const { analytics, resetAnalytics } = useTimer();

    const { totalTimers, avgDuration, messagesSent, durationBrackets } = analytics;

    const chartData = [
        { name: "0-5m", count: durationBrackets["0-5"] },
        { name: "5-15m", count: durationBrackets["5-15"] },
        { name: "15-30m", count: durationBrackets["15-30"] },
        { name: "30-60m", count: durationBrackets["30-60"] },
        { name: "60m+", count: durationBrackets["60+"] },
    ];

    const chartConfig = {
      count: {
        label: "Count",
        color: "hsl(var(--primary))",
      },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChartHorizontal />
                    Event Analytics
                </CardTitle>
                <CardDescription>
                    Summary of timer and message usage for this event.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{totalTimers}</p>
                        <p className="text-xs text-muted-foreground">Timers Used</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{formatTime(avgDuration)}</p>
                        <p className="text-xs text-muted-foreground">Avg. Duration</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{messagesSent}</p>
                        <p className="text-xs text-muted-foreground">Messages Sent</p>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Duration Breakdown
                    </p>
                    <ChartContainer config={chartConfig} className="h-40 w-full">
                      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: -10 }}>
                        <XAxis type="number" dataKey="count" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          width={50}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                </div>
                 <Button onClick={resetAnalytics} variant="link" size="sm" className="p-0 h-auto text-muted-foreground">
                    <RefreshCcw className="mr-2" /> Reset analytics
                </Button>
            </CardContent>
        </Card>
    )
}

function SmartAlertsCard() {
  const [duration, setDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAlerts, setGeneratedAlerts] = useState<GenerateAlertsOutput | null>(null);
  const { toast } = useToast();

  const handleGenerateAlerts = async () => {
    if (duration <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Duration', description: 'Please enter a positive number for the duration.' });
        return;
    }
    setIsLoading(true);
    setGeneratedAlerts(null);
    try {
        const result = await generateAlerts({ durationInMinutes: duration });
        setGeneratedAlerts(result);
    } catch(error) {
        console.error("Error generating smart alerts:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate alerts. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  }

  const getIconForType = (type: string) => {
    switch(type) {
        case 'encouragement': return '😊';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '💬';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileClock />
            AI-Generated Smart Alerts
        </CardTitle>
        <CardDescription>
            Automatically generate a schedule of timed alerts to keep speakers on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <label
                htmlFor="alert-duration"
                className="mb-2 block text-sm font-medium text-muted-foreground"
            >
                Presentation Duration (in minutes)
            </label>
            <div className="flex items-center gap-2">
                <Input
                    id="alert-duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    placeholder="e.g., 45"
                />
                <Button onClick={handleGenerateAlerts} disabled={isLoading}>
                    {isLoading ? <Loader className="mr-2 animate-spin" /> : null}
                    Generate
                </Button>
            </div>
        </div>
        {generatedAlerts && (
            <div className="space-y-3 pt-4">
                 <h4 className="text-sm font-medium text-muted-foreground">Generated Alert Schedule</h4>
                 <div className="space-y-2 rounded-lg border p-3">
                 {generatedAlerts.alerts.sort((a,b) => a.time - b.time).map((alert) => (
                    <div key={alert.time} className="flex items-start gap-3">
                        <div className="flex h-8 w-16 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-mono">
                           {formatTime(alert.time)}
                        </div>
                        <div className="flex-grow rounded-md bg-secondary/50 p-2 text-sm">
                            <span className="mr-2">{getIconForType(alert.type)}</span>
                            {alert.message}
                        </div>
                    </div>
                 ))}
                 </div>
                 <Alert>
                    <AlertTitle>This is a demonstration</AlertTitle>
                    <AlertDescription>
                        In a full implementation, these alerts would be automatically sent to the speaker at the specified times.
                    </AlertDescription>
                 </Alert>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const {
    time,
    isActive,
    toggleTimer,
    resetTimer,
    setDuration,
    theme,
    timersUsed,
    timerLimit,
  } = useTimer();
  
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { toast } = useToast();

  const handleToggleTimer = () => {
    if(!isActive) { // Only when starting
        if (timerLimit !== -1 && timersUsed >= timerLimit) {
            toast({
                variant: 'destructive',
                title: 'Usage Limit Reached',
                description: 'You have used all your timers for this month. Please upgrade or buy more.',
                action: (
                    <Button variant="secondary" onClick={() => setShowPurchaseDialog(true)}>
                        Buy More Timers
                    </Button>
                )
            });
            return;
        }
    }
    toggleTimer();
  }

  const handleSetTime = (newTime: number) => {
    const clampedTime = Math.max(0, newTime);
    if (!isActive) {
      setDuration(clampedTime);
    }
  };

  const presetDurations = [300, 600, 900, 1800, 3600];

  const themeClasses = {
    Classic: "font-mono text-foreground",
    Modern: "font-headline tracking-wide text-foreground",
    Minimalist: "font-sans font-light text-foreground",
    Industrial: "font-mono uppercase text-amber-400",
  };

  const currentThemeClass = themeClasses[theme] || themeClasses.Classic;

  const isAtLimit = timerLimit !== -1 && timersUsed >= timerLimit;


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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
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
                    <div className={cn(
                    "text-8xl font-bold tracking-tighter md:text-9xl",
                    currentThemeClass
                    )}>
                    {formatTime(time)}
                    </div>
                    <div className="flex w-full max-w-sm items-center justify-center space-x-4">
                    <Button
                        onClick={handleToggleTimer}
                        size="lg"
                        className="w-full"
                        disabled={isAtLimit && !isActive}
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
                <LiveMessagingCard />
                <AnalyticsCard />
            </div>

            <div className="space-y-8 lg:col-span-1">
                <CurrentPlanCard />
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
                <SmartAlertsCard />
                <ThemeSelectorCard />
                <ConnectedDevicesCard />
            </div>
          </div>
        </div>
      </main>
      <PurchaseTimersDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
    </div>
  );
}
