import { TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TimerIcon className="h-5 w-5" />
      <span className="font-headline text-lg font-bold">TimeTickR</span>
    </div>
  );
}
