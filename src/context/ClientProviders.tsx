
"use client";

import { TeamProvider } from '@/context/TeamContext';
import { TimerProvider } from '@/context/TimerContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
      <TimerProvider>
        {children}
      </TimerProvider>
    </TeamProvider>
  );
}
