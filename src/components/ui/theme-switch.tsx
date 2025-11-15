"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setChecked(resolvedTheme === "dark"), [resolvedTheme]);

  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      setChecked(isChecked);
      setTheme(isChecked ? "dark" : "light");
    },
    [setTheme],
  );

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border border-border/50 bg-background/60 backdrop-blur-sm shadow-sm transition-colors dark:border-white/15 dark:bg-background/40 dark:shadow-none",
        "h-9 w-20",
        className
      )}
      {...props}
    >
      <Switch
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className={cn(
          "peer absolute inset-0 h-full w-full rounded-full bg-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "[&>span]:h-6 [&>span]:w-6 [&>span]:rounded-full [&>span]:bg-primary/10 [&>span]:shadow-sm [&>span]:z-10 [&>span]:border [&>span]:border-border/30",
          "data-[state=unchecked]:[&>span]:translate-x-1.5",
          "data-[state=checked]:[&>span]:translate-x-[42px]"
        )}
      />

      <span
        className={cn(
          "pointer-events-none absolute left-2.5 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <SunIcon
          size={14}
          className={cn(
            "transition-all duration-200 ease-out",
            checked ? "text-muted-foreground/50" : "text-foreground"
          )}
        />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute right-2.5 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <MoonIcon
          size={14}
          className={cn(
            "transition-all duration-200 ease-out",
            checked ? "text-foreground" : "text-muted-foreground/50"
          )}
        />
      </span>
    </div>
  );
};

export default ThemeSwitch;
