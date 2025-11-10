import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Sidebar } from "@/components/ui/animated-sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Sidebar>
      <div className="flex w-full min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </Sidebar>
  );
}
