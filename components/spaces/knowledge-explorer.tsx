"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function KnowledgeExplorer({}: WorkspacePaneComponentProps) {
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Knowledge Explorer</h3>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
        <p>Browse and organize knowledge captured within this space.</p>
      </div>
    </>
  );
}
