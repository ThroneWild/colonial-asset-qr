import { ReactNode } from "react";
import { AdaptiveNavigationBar } from "@/components/ui/3d-adaptive-navigation-bar";
import { Spotlight } from "@/components/ui/spotlight";
import ThemeSwitch from "@/components/ui/theme-switch";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = resolvedTheme === "dark";

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 -z-30 bg-gradient-to-b from-slate-100 via-white/80 to-background dark:from-slate-950 dark:via-slate-950/95 dark:to-background"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-20 opacity-70 [mask-image:radial-gradient(circle_at_center,_rgba(0,0,0,0.6),_transparent_70%)] dark:bg-grid-white/[0.02]"
        aria-hidden
        style={{
          background: isDark
            ? undefined
            : "radial-gradient(circle at top, rgba(148,163,184,0.22), transparent 65%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <Spotlight
          className="-top-32 left-[12%] md:-top-24 md:left-[20%]"
          fill={isDark ? "rgba(59,130,246,0.45)" : "rgba(59,130,246,0.25)"}
        />
        <Spotlight
          className="bottom-[-25%] right-[-10%] rotate-180"
          fill={isDark ? "rgba(168,85,247,0.4)" : "rgba(14,116,144,0.18)"}
        />
      </div>

      <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
        <AdaptiveNavigationBar />
      </div>

      <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 shadow-lg backdrop-blur-xl transition-colors dark:right-6 dark:top-6 dark:border-white/10 dark:bg-background/60 sm:px-4 sm:py-2">
        <ThemeSwitch className="h-8 w-16" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 rounded-full border-border/50 bg-background/40 text-foreground transition-smooth hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive dark:border-white/10 dark:bg-background/30"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="relative z-10 flex-1 overflow-auto px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-12">
        <div className="mx-auto w-full max-w-7xl space-y-10">{children}</div>
      </main>
    </div>
  );
};

export { AppLayout };
