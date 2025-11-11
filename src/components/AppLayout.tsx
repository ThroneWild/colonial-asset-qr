import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { Home, BarChart3, Package, ScrollText, Tag, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: "Início", url: "/", icon: Home },
    { name: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { name: "Ativos", url: "/assets", icon: Package },
    { name: "Auditoria", url: "/auditoria", icon: ScrollText },
    { name: "Etiquetas", url: "/labels", icon: Tag },
    ...(isAdmin ? [{ name: "Usuários", url: "/users", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen w-full bg-background pb-16 sm:pb-20 md:pb-0 md:pt-20 lg:pt-24">
      <NavBar items={navItems} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export { AppLayout };
