"use client";

import { ReactNode } from "react";

type PaneOneProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function PaneOne({ children }: PaneOneProps) {
  return <section className="flex h-full min-h-[320px] flex-col">{children}</section>;
}
