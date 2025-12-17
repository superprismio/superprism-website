"use client";

import { useState } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ProjectList } from "./project-list";
import { ProjectDetail } from "./project-detail";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

export function SpaceProjects({ heapId }: WorkspacePaneComponentProps) {
  const [selectedProject, setSelectedProject] = useState<ChatSession | null>(
    null
  );

  console.log("projects");

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Projects</h3>
      </header>
        <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
          <ResizablePanel defaultSize={60} minSize={20}>
            <div className="h-full overflow-y-auto">
              <ProjectList
                heapId={heapId}
                selectedProjectId={selectedProject?.id || null}
                onSelectProject={setSelectedProject}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
        
              <ProjectDetail heapId={heapId} project={selectedProject} />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
        <ResizablePanel defaultSize={60} minSize={10}>
          <div className="h-full overflow-y-auto">
            <FileExplorer
              heapId={heapId}
              onPreviewFile={showPreview}
              selectedFileId={previewFile?.id ?? null}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={10}>
          {renderSecondaryContent()}
        </ResizablePanel>
      </ResizablePanelGroup> */}
    </>
  );
}
