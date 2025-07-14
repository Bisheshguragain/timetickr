
import type {Metadata} from 'next';
import './globals.css';
import { AppProviders } from '@/context/AppProviders';
import { Inter, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';


const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


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
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable,
        fontHeadline.variable
      )}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
