
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { TimerProvider } from '@/context/TimerContext';
import { TeamProvider } from '@/context/TeamContext';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'TimeTickR - Professional Event Timers',
  description: 'TimeTickR helps event professionals manage time effectively with beautiful, customizable countdown timers that work seamlessly across all devices.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <TeamProvider>
            <TimerProvider>
              {children}
              <Toaster />
            </TimerProvider>
          </TeamProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
