import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type RetroGridProps = {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lightLineColor?: string;
  darkLineColor?: string;
};

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  bottomImage?: {
    light: string;
    dark: string;
  };
  gridOptions?: RetroGridProps;
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "#d1d5db",
  darkLineColor = "#4b5563",
}: RetroGridProps) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        "opacity-[var(--opacity)]",
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent to-90% dark:from-slate-950" />
    </div>
  );
};

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Prize Patrimônios",
      subtitle = {
        regular: "Inventário hoteleiro com ",
        gradient: "controle em tempo real.",
      },
      description =
        "Centralize o ciclo de vida de móveis, enxoval e equipamentos do hotel. Monitore localização, responsável e histórico de auditoria com precisão digna de cinco estrelas.",
      ctaText = "Registrar novo patrimônio",
      ctaHref = "/assets",
      bottomImage = undefined,
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_60%_70%_at_50%_-20%,rgba(148,163,184,0.25),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_-20%,rgba(37,99,235,0.45),rgba(2,6,23,0))]" />
        <section className="relative z-10 mx-auto max-w-full">
          <RetroGrid {...gridOptions} />
          <div className="mx-auto max-w-screen-xl gap-12 px-4 py-24 md:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl space-y-5 text-center">
              <h1 className="group mx-auto inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300/60 bg-white/80 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-300/70">
                  {title}
                </span>
                <ChevronRight className="h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" />
              </h1>
              <h2 className="text-4xl font-display tracking-tight text-transparent md:text-6xl">
                <span className="bg-[linear-gradient(180deg,_rgba(30,41,59,0.85)_0%,_rgba(100,116,139,0.35)_100%)] bg-clip-text text-transparent dark:bg-[linear-gradient(180deg,_rgba(148,163,184,0.9)_0%,_rgba(226,232,240,0.2)_100%)]">
                  {subtitle.regular}
                </span>
                <span className="heading-shine bg-clip-text text-transparent">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                {description}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <span className="relative inline-flex overflow-hidden rounded-full border border-slate-300/70 bg-white/80 px-[1.5px] py-[1.5px] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/10">
                  <span className="absolute inset-0 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(251,191,36,0.35)_0%,rgba(59,130,246,0.45)_40%,rgba(251,191,36,0.35)_100%)] opacity-60" />
                  <div className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background/85 px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:bg-background/70">
                    <a
                      href={ctaHref}
                      className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-foreground sm:w-auto"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  },
);
HeroSection.displayName = "HeroSection";

export { HeroSection };
