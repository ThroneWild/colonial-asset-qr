import { Home, BarChart3, Package, ScrollText, Tag, LogOut, Wrench } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImage from "@/assets/logo-prize.png";
import { SidebarBody, SidebarLink, useSidebar } from "@/components/ui/animated-sidebar";
import { motion } from "framer-motion";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();

  const menuItems = [
    { label: "Início", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Todos os Ativos", href: "/assets", icon: <Package className="h-5 w-5" /> },
    { label: "Manutenções", href: "/maintenance", icon: <Wrench className="h-5 w-5" /> },
    { label: "Registros de Auditoria", href: "/auditoria", icon: <ScrollText className="h-5 w-5" /> },
    { label: "Etiquetas", href: "/labels", icon: <Tag className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src={logoImage} alt="Prize Logo" className="h-10 w-10 object-contain flex-shrink-0" />
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="flex-1"
          >
            <h2 className="text-lg font-display font-bold text-sidebar-primary">Prize</h2>
            <p className="text-xs text-sidebar-foreground">Patrimônios</p>
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.href}
              link={item}
              onClick={() => navigate(item.href)}
              isActive={isActive(item.href)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-sidebar-border pt-4">
        <SidebarLink
          link={{
            label: "Sair",
            href: "#",
            icon: <LogOut className="h-5 w-5" />,
          }}
          onClick={handleLogout}
          className="hover:bg-destructive/10"
        />
      </div>
    </SidebarBody>
  );
}
