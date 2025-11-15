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
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description =
        "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      bottomImage = {
        light:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
        dark:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
      },
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-0 h-screen w-screen bg-primary/5 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(110,113,202,0.18),rgba(255,255,255,0))] dark:bg-primary/10 dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(110,113,202,0.35),rgba(255,255,255,0))]" />
        <section className="relative z-10 mx-auto max-w-full">
          <RetroGrid {...gridOptions} />
          <div className="mx-auto max-w-screen-xl gap-12 px-4 py-28 md:px-8">
            <div className="mx-auto max-w-3xl space-y-5 text-center">
              <h1 className="group mx-auto inline-flex items-center justify-center gap-2 rounded-3xl border border-border/50 bg-gradient-to-tr from-slate-200/40 via-white/40 to-transparent px-5 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md transition-colors dark:from-slate-900/50 dark:via-slate-900/30 dark:text-slate-300 dark:shadow-none">
                {title}
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </h1>
              <h2 className="text-4xl font-display tracking-tight text-transparent md:text-6xl">
                <span className="bg-[linear-gradient(180deg,_#0f172a_0%,_rgba(15,23,42,0.75)_100%)] bg-clip-text text-transparent dark:bg-[linear-gradient(180deg,_#f8fafc_0%,_rgba(248,250,252,0.05)_100%)]">
                  {subtitle.regular}
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-orange-200">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300">
                {description}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-3xl dark:bg-slate-950 dark:text-white">
                    <a
                      href={ctaHref}
                      className="inline-flex w-full items-center justify-center rounded-full border border-input bg-gradient-to-tr from-slate-200/50 via-purple-200/40 to-transparent px-10 py-4 text-center transition-all hover:from-slate-200/70 hover:via-purple-200/60 hover:to-transparent dark:from-slate-800/50 dark:via-purple-800/40 dark:hover:from-slate-700/60 dark:hover:via-purple-700/50 sm:w-auto"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="relative z-10 mt-32">
                <img
                  src={bottomImage.light}
                  className="w-full rounded-lg border border-slate-200 shadow-xl dark:hidden"
                  alt="Dashboard preview"
                />
                <img
                  src={bottomImage.dark}
                  className="hidden w-full rounded-lg border border-slate-800 shadow-xl dark:block"
                  alt="Dashboard preview"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    );
  },
);
HeroSection.displayName = "HeroSection";

export { HeroSection };
