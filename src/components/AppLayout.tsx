import { ReactNode, useMemo } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import ThemeSwitch from "@/components/ui/theme-switch";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <ShaderAnimation />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.45),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
        <AdaptiveNavigationBar />
      </div>

      <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-background/70 px-4 py-2 backdrop-blur-xl">
        <ThemeSwitch className="h-8 w-16" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 rounded-full border-white/10 bg-background/30 text-foreground transition-smooth hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="relative z-10 flex-1 overflow-auto px-4 pb-16 pt-28 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-7xl space-y-10">{children}</div>
      </main>
    </div>
  );
};

export { AppLayout };
