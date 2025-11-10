"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaneOneProps = {
  title: string;
  description?: string | null;
  children: ReactNode;
  className?: string;
};

export function PaneOne({
  title,
  description,
  children,
  className,
}: PaneOneProps) {
  return (
    <section
      className={cn(
        "flex min-h-[320px] flex-col border-r p-4 shadow-sm md:p-6",
        className
      )}
    >
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
