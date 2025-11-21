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
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_60%_70%_at_50%_-20%,rgba(30,64,175,0.35),rgba(2,6,23,0))] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_-20%,rgba(37,99,235,0.45),rgba(2,6,23,0))]" />
        <section className="relative z-10 mx-auto max-w-full">
          <RetroGrid {...gridOptions} />
          <div className="mx-auto max-w-screen-xl gap-12 px-4 py-16 md:py-28 md:px-8">
            <div className="mx-auto max-w-3xl space-y-4 md:space-y-5 text-center">
              <h1 className="group mx-auto inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-slate-200 shadow-sm backdrop-blur-2xl">
                <span className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.35em] text-slate-300/70">
                  {title}
                </span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" />
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-display tracking-tight text-transparent">
                <span className="bg-[linear-gradient(180deg,_rgba(148,163,184,0.9)_0%,_rgba(226,232,240,0.2)_100%)] bg-clip-text text-transparent">
                  {subtitle.regular}
                </span>
                <span className="heading-shine bg-clip-text text-transparent">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-sm md:text-base text-slate-300 px-4">
                {description}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-2">
                <span className="relative inline-flex overflow-hidden rounded-full border border-white/10 bg-white/10 px-[1.5px] py-[1.5px] backdrop-blur-xl">
                  <span className="absolute inset-0 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(251,191,36,0.45)_0%,rgba(30,64,175,0.6)_40%,rgba(251,191,36,0.45)_100%)] opacity-60" />
                  <div className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background/80 px-6 py-3 md:px-10 md:py-4 text-xs font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] text-foreground transition-all hover:bg-background/70 touch-target">
                    <a
                      href={ctaHref}
                      className="inline-flex w-full items-center justify-center gap-2 text-xs md:text-sm font-medium text-foreground sm:w-auto"
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
