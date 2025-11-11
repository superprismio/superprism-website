"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceMembers({}: WorkspacePaneComponentProps) {
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Members</h3>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
        <p>Manage who has access to this space and their roles.</p>
        <p className="text-xs">
          Invite new teammates or adjust permissions from here.
        </p>
      </div>
    </>
  );
}
