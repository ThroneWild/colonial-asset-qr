import { ReactNode } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout = ({
  children
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Fixed 3D Navigation Bar */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <AdaptiveNavigationBar />
      </div>
      
      <main className="flex-1 overflow-auto pt-24">
        {children}
      </main>
    </div>
  );
};
export { AppLayout };