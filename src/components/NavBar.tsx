import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LucideIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  action?: () => void;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 md:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 md:mt-6",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-background/80 border border-border backdrop-blur-lg py-2 px-2 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <button
              key={item.name}
              onClick={() => item.action ? item.action() : navigate(item.url)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                active && "text-primary"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden flex items-center justify-center">
                <Icon size={20} strokeWidth={2.5} />
              </span>
              {active && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full hidden md:block">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          onClick={handleLogout}
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-full transition-colors",
            "text-destructive/80 hover:text-destructive"
          )}
        >
          <span className="hidden md:inline">Sair</span>
          <span className="md:hidden flex items-center justify-center">
            <LogOut size={20} strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </div>
  );
}
