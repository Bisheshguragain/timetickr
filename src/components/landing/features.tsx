import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChartBig,
  Bell,
  MessageSquare,
  Monitor,
  RadioTower,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <RadioTower className="h-8 w-8 text-primary" />,
    title: "Remote Stage Timer",
    description: "Control countdowns from any device while speakers see a clean, distraction-free display.",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Live Admin Messaging",
    description: "Send instant messages from your admin panel directly to speaker screens for real-time cues.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "AI-Powered Moderation",
    description: "Ensure all on-screen messages are professional with our built-in AI content moderator.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Team & Role Management",
    description: "Invite team members and assign specific roles and permissions for collaborative event management.",
  },
  {
    icon: <Bell className="h-8 w-8 text-primary" />,
    title: "Smart Auto-Alerts",
    description: "Intelligent alerts automatically notify speakers of key time milestones, keeping them on track.",
  },
  {
    icon: <Monitor className="h-8 w-8 text-primary" />,
    title: "Multi-Device Projection",
    description: "Display timers on any screen size with our dedicated projection mode for ultimate flexibility.",
  },
  {
    icon: <BarChartBig className="h-8 w-8 text-primary" />,
    title: "Analytics & Export",
    description: "Track event performance with detailed analytics and export data for post-event analysis.",
  },
];

export function Features() {
  return (
    <div className="container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          All-in-One Platform for Flawless Events
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          TimeTickR provides all the tools you need to run your events smoothly and professionally.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.slice(0, 3).map((feature) => (
          <Card key={feature.title} className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              {feature.icon}
              <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-2">
        {features.slice(3).map((feature, index) => (
          <div key={feature.title} className="flex gap-6">
            <div className="flex-shrink-0">{feature.icon}</div>
            <div>
              <h3 className="font-headline text-lg font-semibold">{feature.title}</h3>
              <p className="mt-1 text-foreground/80">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
