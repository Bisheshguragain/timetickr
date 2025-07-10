"use client";

import Image from "next/image";

export function TimerDemo() {
  return (
    <div className="container">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            A Glimpse of Our Clean, Distraction-Free Speaker Display
          </h2>
          <p className="mt-6 text-lg text-foreground/80">
            Our intuitive timer interface is designed to keep speakers focused and on track. With a minimalist design, customizable alerts, and real-time messaging, you can ensure a seamless experience for both your speakers and your audience.
          </p>
        </div>
        <div className="rounded-xl border bg-card/50 p-4 shadow-lg">
          <Image
            src="https://placehold.co/1200x900.png"
            alt="Timer Interface"
            data-ai-hint="timer interface"
            width={1200}
            height={900}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
