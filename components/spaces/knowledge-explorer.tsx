"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { FileExplorer } from "./file-explorer";
import { KnowledgeGraph } from "./knowledge-graph";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";

export function KnowledgeExplorer({ heapId }: WorkspacePaneComponentProps) {
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Knowledge Explorer</h3>
      </header>

      <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
        <ResizablePanel defaultSize={60} minSize={10}>
          <div className="h-full overflow-y-auto">

          <FileExplorer heapId={heapId} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={10}>
          <KnowledgeGraph />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
