import { ReactNode } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Spotlight } from "@/components/ui/spotlight";
import ThemeSwitch from "@/components/ui/theme-switch";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 z-background bg-gradient-to-b from-slate-950 via-slate-950/95 to-background"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-grid bg-grid-white/[0.02] opacity-60 [mask-image:radial-gradient(circle_at_center,_rgba(0,0,0,0.85),_transparent_75%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-spotlight overflow-hidden" aria-hidden>
        <Spotlight className="-top-32 left-[10%] md:-top-20 md:left-[20%]" fill="rgba(59,130,246,0.45)" />
        <Spotlight className="bottom-[-25%] right-[-10%] rotate-180" fill="rgba(168,85,247,0.4)" />
      </div>

      {/* Navigation - Desktop: 3D bar centered, Mobile: Hamburger menu left */}
      {isMobile ? (
        <div className="fixed left-4 top-4 z-navigation">
          <MobileNavigation />
        </div>
      ) : (
        <div className="fixed left-1/2 top-6 z-navigation -translate-x-1/2">
          <AdaptiveNavigationBar />
        </div>
      )}

      {/* Top right controls - Theme & Logout */}
      <div className={`fixed right-4 top-4 z-navigation flex items-center gap-2 rounded-full border border-white/10 bg-background/70 backdrop-blur-xl ${
        isMobile ? 'px-2 py-2' : 'px-4 py-2'
      }`}>
        <ThemeSwitch className={isMobile ? 'h-6 w-12' : 'h-8 w-16'} />
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className={`rounded-full border-white/10 bg-background/30 text-foreground transition-smooth hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive ${
            isMobile ? 'h-9 w-9' : 'h-8 w-8'
          }`}
          title="Sair"
        >
          <LogOut className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
        </Button>
      </div>

      <main className={`relative z-content flex-1 overflow-auto pb-16 ${
        isMobile ? 'px-4 pt-20' : 'px-4 pt-28 sm:px-6 lg:px-12'
      }`}>
        <div className="mx-auto w-full max-w-7xl space-y-6 md:space-y-10">{children}</div>
      </main>
    </div>
  );
};

export { AppLayout };
