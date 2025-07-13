import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChartBig,
  Bell,
  Check,
  MessageSquare,
  Monitor,
  RadioTower,
  ShieldCheck,
  Users,
  Volume2,
} from "lucide-react";

const features = [
  {
    icon: <RadioTower className="h-8 w-8 text-primary" />,
    title: "Remote Stage Timer",
    description: "Control countdowns from any device while your speakers see a clean, distraction-free display.",
    subFeatures: [
        "Start/Pause/Reset from admin dashboard",
        "Multiple preset durations",
        "Works on mobile, tablet, TV screens",
        "Real-time synchronization"
    ]
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Live Admin Messaging",
    description: "Send instant messages from your admin panel directly to speaker screens for real-time cues.",
     subFeatures: [
        "Pop-up messages on speaker view",
        "Pre-written quick messages",
        "Custom message creation",
        "Visual alerts and notifications"
    ]
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Team & Role Management",
    description: "Invite team members and assign specific roles and permissions for collaborative event management.",
     subFeatures: [
        "Admin: Full control access",
        "Speaker: View-only mode",
        "Viewer: Large-screen display",
        "Advanced permission system"
    ]
  },
  {
    icon: <Bell className="h-8 w-8 text-primary" />,
    title: "Smart Auto-Alerts",
    description: "Intelligent alerts automatically notify speakers of key time milestones, keeping them on track.",
     subFeatures: [
        "Auto 5-minute warnings",
        "Overtime red timer alerts",
        "Visual and audio cues",
        "Manual override controls"
    ]
  },
  {
    icon: <Monitor className="h-8 w-8 text-primary" />,
    title: "Multi-Device Projection",
    description: "Display timers on any screen size with our dedicated projection mode for ultimate flexibility.",
     subFeatures: [
        "Dedicated projection view",
        "Minimal distraction interface",
        "Auto-scaling for any screen",
        "Works from phones to jumbo screens"
    ]
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "AI-Powered Moderation",
    description: "Ensure all on-screen messages are professional with our built-in AI content moderator.",
     subFeatures: [
        "Automatic message screening",
        "Blocks offensive language",
        "Prevents inappropriate content",
        "Maintains event professionalism"
    ]
  },
  {
    icon: <BarChartBig className="h-8 w-8 text-primary" />,
    title: "Analytics & Export",
    description: "Track event performance with detailed analytics and export data for post-event analysis.",
     subFeatures: [
        "Detailed performance tracking",
        "Post-event data export",
        "Insightful visualizations",
        "Customizable reports"
    ]
  },
   {
    icon: <Volume2 className="h-8 w-8 text-primary" />,
    title: "AI-Powered Text-to-Speech",
    description: "Convert your generated presentation script into natural-sounding audio for practice or accessibility.",
     subFeatures: [
        "Generate audio from scripts",
        "Practice talk timing and delivery",
        "Create accessible content",
        "High-quality, natural voices"
    ]
  },
];

export function Features() {
  return (
    <div className="container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Core Features
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          Everything you need for flawless event timing and presentation management
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col bg-secondary/30 border-secondary hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {feature.icon}
              <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-foreground/80">{feature.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {feature.subFeatures.map((subFeature) => (
                  <li key={subFeature} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-foreground/80">{subFeature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
