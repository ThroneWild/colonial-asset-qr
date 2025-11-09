import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({ message = "Carregando...", className }: LoadingOverlayProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="glass-light p-8 rounded-lg flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </div>
  );
};