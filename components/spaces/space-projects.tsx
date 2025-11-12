"use client";

import { TextEditor } from "./text-editor";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function SpaceProjects({ heapId }: WorkspacePaneComponentProps) {
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Artifacts</h3>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4 ">
        <TextEditor heapId={heapId} />
      </div>
    </>
  );
}
