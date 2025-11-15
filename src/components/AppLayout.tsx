import { ReactNode } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import ThemeSwitch from "@/components/ui/theme-switch";

interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout = ({
  children
}: AppLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ShaderAnimation className="absolute inset-0 min-h-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>
      {/* Fixed 3D Navigation Bar */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <AdaptiveNavigationBar />
      </div>
      
      {/* Theme Switch */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeSwitch />
      </div>
      
      <main className="relative z-10 flex-1 overflow-auto pt-24">
        {children}
      </main>
    </div>
  );
};
export { AppLayout };
