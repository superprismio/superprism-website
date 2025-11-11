"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaneOneProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function PaneOne({ title, children, className }: PaneOneProps) {
  return (
    <section
      className={cn(
        "flex min-h-[320px] flex-col border-r p-4 shadow-sm md:p-6",
        className
      )}
    >
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
