"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceProjects({}: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Projects</p>
    </div>
  );
}
