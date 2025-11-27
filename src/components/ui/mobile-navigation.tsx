import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Home,
  LayoutDashboard,
  Package,
  Wrench,
  FileText,
  Tags,
  Building2
} from 'lucide-react';

interface NavItem {
  label: string;
  id: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Início', id: 'home', path: '/', icon: <Home className="h-5 w-5" /> },
  { label: 'Dashboard', id: 'dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Ativos', id: 'assets', path: '/assets', icon: <Package className="h-5 w-5" /> },
  { label: 'Manutenções', id: 'maintenance', path: '/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Apartamentos', id: 'apartments', path: '/apartamentos', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Auditoria', id: 'audit', path: '/auditoria', icon: <FileText className="h-5 w-5" /> },
  { label: 'Etiquetas', id: 'labels', path: '/labels', icon: <Tags className="h-5 w-5" /> },
];

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-white/10 bg-background/70 text-foreground backdrop-blur-xl transition-smooth hover:bg-background/90"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-white/10 bg-background/95 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-2 pt-8">
          <div className="mb-4 px-2">
            <h2 className="text-lg font-semibold text-foreground">Navegação</h2>
          </div>
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 text-left transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                <span className="text-base">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
