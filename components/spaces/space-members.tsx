"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceMembers({}: WorkspacePaneComponentProps) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Manage who has access to this space and their roles.</p>
      <p className="text-xs">
        Invite new teammates or adjust permissions from here.
      </p>
    </div>
  );
}
