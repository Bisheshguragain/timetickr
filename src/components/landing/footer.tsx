import Link from "next/link";
import { TimerIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <TimerIcon className="h-5 w-5 text-primary" />
            <span className="font-headline text-lg font-bold">TimeTickR</span>
          </div>
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} TimeTickR, Inc. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
