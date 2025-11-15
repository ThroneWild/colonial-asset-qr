import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeading({ title, description, eyebrow, actions, className }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-6 rounded-3xl border border-white/10 bg-background/60 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.35em] text-slate-300/80">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-display tracking-tight text-transparent sm:text-4xl">
          <span className="heading-shine bg-clip-text text-transparent">{title}</span>
        </h1>
        {description && <p className="text-sm text-slate-300/90">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
