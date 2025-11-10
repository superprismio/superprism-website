"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceChat({ onOpenPaneTwo }: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Talk to your knowledge</p>
      <p className="text-xs">
        This is a placeholder for the full chat experience.
      </p>
    </div>
  );
}
