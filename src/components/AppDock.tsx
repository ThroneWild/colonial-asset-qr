import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, Package, ScrollText, Tag, LogOut, Moon, Sun } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/auth");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuItems = [
    {
      title: "Home",
      icon: <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/",
    },
    {
      title: "Dashboard",
      icon: <BarChart3 className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/dashboard",
    },
    {
      title: "Todos os Itens",
      icon: <Package className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/assets",
    },
    {
      title: "Registros de Auditoria",
      icon: <ScrollText className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/auditoria",
    },
    {
      title: "Imprimir Etiquetas",
      icon: <Tag className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/labels",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Dock className="items-end pb-3">
        {menuItems.map((item, idx) => (
          <div 
            key={idx} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(item.href);
            }}
            className="cursor-pointer"
          >
            <DockItem
              className={`aspect-square rounded-full transition-all ${
                isActive(item.href)
                  ? "bg-primary dark:bg-primary shadow-lg ring-2 ring-primary/50"
                  : "bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700"
              }`}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <div className={isActive(item.href) ? "text-primary-foreground" : ""}>
                  {item.icon}
                </div>
              </DockIcon>
            </DockItem>
          </div>
        ))}
        
        <div className="h-8 w-[1px] bg-gray-300 dark:bg-neutral-700 self-center" />
        
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="cursor-pointer"
        >
          <DockItem className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700">
            <DockLabel>Tema</DockLabel>
            <DockIcon>
              {theme === "dark" ? (
                <Sun className="h-full w-full text-neutral-600 dark:text-neutral-300" />
              ) : (
                <Moon className="h-full w-full text-neutral-600 dark:text-neutral-300" />
              )}
            </DockIcon>
          </DockItem>
        </div>
        
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
          }}
          className="cursor-pointer"
        >
          <DockItem className="aspect-square rounded-full bg-red-200 dark:bg-red-900/30 hover:bg-red-300 dark:hover:bg-red-900/50">
            <DockLabel>Sair</DockLabel>
            <DockIcon>
              <LogOut className="h-full w-full text-red-600 dark:text-red-400" />
            </DockIcon>
          </DockItem>
        </div>
      </Dock>
    </div>
  );
}
