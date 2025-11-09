import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Glass variants for conservation states with micro-interactions
        "glass-excellent": "glass-light border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 backdrop-blur-xl active:scale-95",
        "glass-good": "glass-light border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 backdrop-blur-xl active:scale-95",
        "glass-fair": "glass-light border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 backdrop-blur-xl active:scale-95",
        "glass-poor": "glass-light border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-xl active:scale-95",
        "glass-primary": "glass-light border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-xl active:scale-95",
        "glass-gold": "glass-light border-prize-gold/30 bg-prize-gold/10 text-prize-gold hover:bg-prize-gold/20 hover:border-prize-gold/50 hover:scale-105 hover:shadow-lg hover:shadow-prize-gold/30 backdrop-blur-xl active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
