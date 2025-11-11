"use client";

import { ReactNode } from "react";

type PaneOneProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function PaneOne({ title, children }: PaneOneProps) {
  return (
    <section className="flex min-h-[320px] flex-col border-r">
      <header className="gap-4 border-b px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">
          {title ?? "Secondary"}
        </h3>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </section>
  );
}
