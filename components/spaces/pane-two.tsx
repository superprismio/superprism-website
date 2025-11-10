"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type PaneTwoProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function PaneTwo({ title, isOpen, onClose, children }: PaneTwoProps) {
  if (!isOpen) {
    return (
      <aside className="hidden min-h-[320px] rounded-lg text-center text-xs font-medium text-muted-foreground md:flex md:flex-col md:items-center md:justify-center">
        Secondary pane collapsed
      </aside>
    );
  }

  return (
    <aside className="flex min-h-[320px] flex-col rounded-lg border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {title ?? "Secondary"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          )}
          aria-label="Close secondary pane"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </aside>
  );
}
