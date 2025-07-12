
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, X, MonitorPlay, Loader, MessageSquareQuote, Info, Bot } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function PairingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sessionCode: validSessionCode } = useTimer();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
            <Loader className="h-12 w-12 animate-spin text-white" />
        </div>
    );
  }

  const urlCode = searchParams.get('code');
  const isPaired = urlCode === validSessionCode && validSessionCode !== '';

  if (isPaired) {
    return <>{children}</>;
  }

  const handlePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === validSessionCode) {
        setError('');
        router.push(`${pathname}?code=${code.toUpperCase()}`);
    } else {
        setError('Invalid pairing code. Please try again.');
    }
  }

  // If there's a code in the URL but it's not valid (e.g., old session), show the form.
  // Also show the form if there is no code in the URL at all.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MonitorPlay />
                    Pair Speaker View
                </CardTitle>
                <CardDescription>
                    Enter the pairing code from your admin dashboard to connect this display.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handlePair} className="space-y-4">
                    <Input 
                        placeholder="Enter pairing code..."
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="text-center text-lg font-mono tracking-widest"
                        autoCapitalize="characters"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full">
                        Connect Display
                    </Button>
                </form>
                 <p className="text-xs text-muted-foreground mt-4">
                    Note: For this to work, the admin dashboard must have been opened first in this browser to generate a session code.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}


function SpeakerDisplay() {
  const timerContext = useTimer();
  const searchParams = useSearchParams();
  
  // Demo mode is now explicitly for when no admin session is active.
  const isDemoMode = !timerContext.sessionCode;
  
  const [demoMessage, setDemoMessage] = useState<{id: number, text: string} | null>(null);

  const message = isDemoMode ? demoMessage : timerContext.message;
  const dismissMessage = isDemoMode ? () => setDemoMessage(null) : timerContext.dismissMessage;
  
  const { time, isFinished, theme, plan, customLogo } = timerContext;


  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (message) {
      console.log("New message received by speaker:", message);
    }
  }, [message]);

  const themeClasses = {
    Classic: {
      bg: "bg-gray-900 text-white",
      time: "font-mono",
      warningBg: "bg-yellow-600",
      urgentBg: "bg-orange-700",
      finishedBg: "bg-red-800",
      alert: "bg-white/90 text-black border-gray-300",
      logo: "text-white/50",
    },
    Modern: {
      bg: "bg-gray-900 text-white",
      time: "font-headline tracking-wide",
      warningBg: "bg-blue-800",
      urgentBg: "bg-purple-800",
      finishedBg: "bg-red-900",
      alert: "bg-gray-800/90 text-white border-gray-600 backdrop-blur-sm",
      logo: "text-white/40",
    },
    Minimalist: {
      bg: "bg-gray-100 text-gray-800",
      time: "font-sans font-light border-4 border-gray-200 p-8 rounded-lg",
      warningBg: "bg-yellow-200 border-yellow-300",
      urgentBg: "bg-orange-200 border-orange-300",
      finishedBg: "bg-red-200 border-red-300",
      alert: "bg-white/80 text-gray-800 border-gray-300 backdrop-blur-sm shadow-2xl",
      logo: "text-gray-400",
    },
    Industrial: {
      bg: "bg-gray-800 text-amber-400",
      time: "font-mono uppercase",
      warningBg: "bg-yellow-800/50",
      urgentBg: "bg-orange-800/60",
      finishedBg: "bg-red-800/70",
      alert: "bg-gray-900/90 text-amber-300 border-amber-900/50 backdrop-blur-sm",
      logo: "text-amber-400/30",
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.Classic;
  const isQuestion = message?.text.startsWith("Q:");

  const triggerDemoMessage = () => {
    setDemoMessage({id: Date.now(), text: "You have 5 minutes remaining."});
  }

  const triggerDemoQuestion = () => {
    setDemoMessage({id: Date.now(), text: "Q: Can you elaborate on the key findings from your research?"});
  }


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
      {/* Admin Message - Top Left */}
      {message && !isQuestion && (
        <div className="absolute top-10 left-10 z-10 max-w-lg animate-in fade-in-50 slide-in-from-top-10 duration-500">
           <Alert variant="default" className={cn("shadow-2xl", currentTheme.alert)}>
             <MessageSquare className="h-6 w-6" />
             <AlertTitle className="text-lg font-bold">
                Message from Admin
             </AlertTitle>
             <AlertDescription className="text-md">
                {message.text}
             </AlertDescription>
             <button onClick={dismissMessage} className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <X className="h-5 w-5"/>
             </button>
           </Alert>
        </div>
      )}

      {/* Main Timer */}
      <div
        className={cn(
          "font-bold",
          currentTheme.time
        )}
        style={{ fontSize: "clamp(5rem, 25vw, 20rem)", lineHeight: 1 }}
      >
        {formatTime(time)}
      </div>

      {/* Audience Question - Below Timer */}
      {message && isQuestion && (
        <div className="z-10 mt-8 max-w-4xl w-full px-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
           <Alert variant="default" className={cn("shadow-2xl", currentTheme.alert)}>
             <MessageSquareQuote className="h-6 w-6" />
             <AlertTitle className="text-xl font-bold">
                Audience Question
             </AlertTitle>
             <AlertDescription className="text-lg">
                {message.text.substring(2)}
             </AlertDescription>
             <button onClick={dismissMessage} className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <X className="h-5 w-5"/>
             </button>
           </Alert>
        </div>
      )}

      {/* Branding Logo */}
      <div className="absolute top-4 right-5 z-20">
        {customLogo && plan === 'Enterprise' ? (
             <Image src={customLogo} alt="Custom Event Logo" width={120} height={50} className="object-contain" />
        ) : plan !== "Enterprise" ? (
            <Logo className={currentTheme.logo}/>
        ) : null}
      </div>

      {/* Demo Controls */}
      {isDemoMode && (
          <div className="absolute top-4 left-5 z-20 space-y-2">
            <Alert variant="default" className={cn("shadow-md text-xs p-2", currentTheme.alert)}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Demo mode. Not connected to an admin panel.
                </AlertDescription>
            </Alert>
            <Card className={cn("p-2", currentTheme.alert)}>
                <CardHeader className="p-1 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Bot className="h-4 w-4"/> Demo Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col items-start gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={triggerDemoMessage}>Trigger Admin Message</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={triggerDemoQuestion}>Trigger Audience Q&amp;A</Button>
                </CardContent>
            </Card>
          </div>
      )}

    </div>
  );
}


export default function SpeakerViewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-gray-900"><Loader className="h-12 w-12 animate-spin text-white" /></div>}>
            <PairingGate>
                <SpeakerDisplay />
            </PairingGate>
        </Suspense>
    )
}
