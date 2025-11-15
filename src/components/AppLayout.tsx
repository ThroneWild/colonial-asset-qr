import { PropsWithChildren } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import ThemeSwitch from "@/components/ui/theme-switch";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AppLayout = ({ children }: PropsWithChildren) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ShaderAnimation className="absolute inset-0 min-h-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>
      
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <AdaptiveNavigationBar />
      </div>
      
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeSwitch className="h-8 w-16" />
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-smooth"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="relative z-10 flex-1 overflow-auto pt-24">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export { AppLayout };
