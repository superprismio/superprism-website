"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceSettings({ onOpenPaneTwo }: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Configure preferences and integrations for this space.</p>
      <p className="text-xs">
        Additional configuration options will appear in upcoming iterations.
      </p>
    </div>
  );
}


