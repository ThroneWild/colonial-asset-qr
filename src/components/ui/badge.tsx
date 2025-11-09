import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Glass variants for conservation states
        "glass-excellent": "glass-light border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 backdrop-blur-xl",
        "glass-good": "glass-light border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 backdrop-blur-xl",
        "glass-fair": "glass-light border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 backdrop-blur-xl",
        "glass-poor": "glass-light border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20 backdrop-blur-xl",
        "glass-primary": "glass-light border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-xl",
        "glass-gold": "glass-light border-prize-gold/30 bg-prize-gold/10 text-prize-gold hover:bg-prize-gold/20 backdrop-blur-xl",
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
