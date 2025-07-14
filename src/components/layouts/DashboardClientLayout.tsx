
"use client";

import { Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Timer, Users, BarChart, Settings, Home, Sparkles } from "lucide-react";
import ThemeToggleButton from "../ui/ThemeToggleButton";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";

const SidebarProvider = dynamic(() => import('@/components/ui/sidebar').then(mod => mod.SidebarProvider), {
  ssr: false,
  loading: () => (
     <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <div className="peer hidden md:block">
            <Skeleton className="h-full w-[3rem]" />
        </div>
        <main className="flex min-h-svh flex-1 flex-col bg-background p-4">
          <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <Skeleton className="h-8 w-8 sm:hidden" />
          </header>
          <div className="mt-4">
              <Skeleton className="h-[calc(100vh-8rem)] w-full" />
          </div>
        </main>
    </div>
  )
});


export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <ThemeToggleButton />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Timer />
                Timers
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Sparkles />
                AI Tools
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Users />
                Team
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <BarChart />
                Analytics
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
        </header>
        <main className="flex-1 p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
