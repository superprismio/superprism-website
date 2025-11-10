"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function KnowledgeExplorer({
  onOpenPaneTwo,
}: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Browse and organize knowledge captured within this space.</p>
      <p className="text-xs">
        Use the secondary pane to drill into related artifacts when needed.
      </p>
    </div>
  );
}


