import { ReactNode } from "react";
import { AppDock } from "@/components/AppDock";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background pb-24">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      <AppDock />
    </div>
  );
}
