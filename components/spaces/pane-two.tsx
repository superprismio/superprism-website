"use client";

import { ReactNode } from "react";

type PaneTwoProps = {
  title?: string;
  children?: ReactNode;
};

export function PaneTwo({ children }: PaneTwoProps) {
  return <aside className="flex h-full min-h-[320px] flex-col">{children}</aside>;
}
