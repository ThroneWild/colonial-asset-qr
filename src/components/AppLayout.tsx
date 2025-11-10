import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { Home, BarChart3, Package, ScrollText, Tag } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Início", url: "/", icon: Home },
  { name: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { name: "Ativos", url: "/assets", icon: Package },
  { name: "Auditoria", url: "/auditoria", icon: ScrollText },
  { name: "Etiquetas", url: "/labels", icon: Tag },
];

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background pb-24 md:pb-0 md:pt-24">
      <NavBar items={navItems} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
