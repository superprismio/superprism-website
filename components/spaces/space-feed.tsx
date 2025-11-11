"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceFeed({}: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <p>Stay up to date with the latest activity happening in this space.</p>
    </div>
  );
}
