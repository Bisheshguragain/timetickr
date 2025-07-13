
"use client";

import { MessageSquareText } from "lucide-react";

export function TimerDemo() {
  return (
    <div className="container px-0">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="px-4">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            A Glimpse of Our Clean, Distraction-Free Speaker Display
          </h2>
          <p className="mt-6 text-lg text-foreground/80">
            Our intuitive timer interface is designed to keep speakers focused and on track. With a minimalist design, customizable alerts, and real-time messaging, you can ensure a seamless experience for both your speakers and your audience.
          </p>
        </div>
        <div className="rounded-xl border bg-card/50 p-4 shadow-lg">
          <div className="aspect-[4/3] w-full rounded-lg bg-background flex flex-col justify-between p-4 md:p-8">
            <div className="flex-grow flex items-center justify-center">
                <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono tracking-tighter text-foreground">
                    14:32
                </h1>
            </div>
            <div className="flex-shrink-0">
                <div className="flex items-center gap-4 rounded-lg bg-primary/10 p-4 text-primary-foreground border border-primary/20">
                    <MessageSquareText className="h-8 w-8 text-primary flex-shrink-0" />
                    <p className="text-base md:text-lg font-medium text-foreground">
                        "Your presentation is going great! Keep up the excellent work."
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
