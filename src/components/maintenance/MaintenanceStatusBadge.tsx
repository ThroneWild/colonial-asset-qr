import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MaintenanceStatus } from "@/types/maintenance";

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  Pendente: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  Agendada: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Em andamento": "bg-orange-500/15 text-orange-700 border-orange-500/30",
  Concluída: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Atrasada: "bg-red-500/15 text-red-700 border-red-500/30 animate-pulse",
};

export interface MaintenanceStatusBadgeProps {
  status: MaintenanceStatus;
  className?: string;
}

export const MaintenanceStatusBadge = ({ status, className }: MaintenanceStatusBadgeProps) => {
  return (
    <Badge variant="outline" className={cn("px-3 py-1 text-xs font-semibold", STATUS_STYLES[status], className)}>
      {status}
    </Badge>
  );
};
