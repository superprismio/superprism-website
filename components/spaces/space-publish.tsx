"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpacePublish({}: WorkspacePaneComponentProps) {
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Publish</h3>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
        <p>Publish</p>
      </div>
    </>
  );
}
