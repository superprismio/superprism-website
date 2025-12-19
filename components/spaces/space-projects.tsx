"use client";

import { useState, useCallback, useEffect } from "react";
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

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; fileIds: string[] };
  created_at: null;
};

export function SpaceProjects({ heapId }: WorkspacePaneComponentProps) {
  const [selectedProject, setSelectedProject] = useState<ChatSession | PendingProject | null>(
    null
  );

  // Create or get pending project
  const getOrCreatePendingProject = useCallback((): PendingProject => {
    if (selectedProject && selectedProject.id === null) {
      return selectedProject as PendingProject;
    }
    return {
      id: null,
      title: "New Project",
      meta: { isProject: true, fileIds: [] },
      created_at: null,
    };
  }, [selectedProject]);

  // Handle adding file to pending project
  const handleAddFileToProject = useCallback((fileId: string) => {
    const pending = getOrCreatePendingProject();
    if (!pending.meta.fileIds.includes(fileId)) {
      const updatedPending: PendingProject = {
        ...pending,
        meta: {
          ...pending.meta,
          fileIds: [...pending.meta.fileIds, fileId],
        },
      };
      setSelectedProject(updatedPending);
    }
  }, [getOrCreatePendingProject]);

  // Handle updating pending project fileIds
  const handleUpdatePendingProject = useCallback((fileIds: string[]) => {
    if (selectedProject && selectedProject.id === null) {
      const updatedPending: PendingProject = {
        ...selectedProject as PendingProject,
        meta: {
          ...(selectedProject as PendingProject).meta,
          fileIds,
        },
      };
      setSelectedProject(updatedPending);
    }
  }, [selectedProject]);

  // Handle updating pending project title
  const handleUpdatePendingProjectTitle = useCallback((title: string) => {
    if (selectedProject && selectedProject.id === null) {
      const updatedPending: PendingProject = {
        ...selectedProject as PendingProject,
        title,
      };
      setSelectedProject(updatedPending);
    }
  }, [selectedProject]);

  // Expose handler to window for cross-pane communication
  useEffect(() => {
    (window as unknown as { addFileToProject?: (fileId: string) => void }).addFileToProject = handleAddFileToProject;
    return () => {
      delete (window as unknown as { addFileToProject?: (fileId: string) => void }).addFileToProject;
    };
  }, [handleAddFileToProject]);

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
                onSelectProject={(project) => {
                  // Only set if it's a real project (not pending)
                  if (project && project.id !== null) {
                    setSelectedProject(project);
                  }
                }}
                onOpenProject={(project) => {
                  setSelectedProject(project);
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
        
              <ProjectDetail 
                heapId={heapId} 
                project={selectedProject} 
                onUpdatePendingProject={handleUpdatePendingProject}
                onUpdatePendingProjectTitle={handleUpdatePendingProjectTitle}
                onProjectCreated={(project) => {
                  setSelectedProject(project);
                }}
                onProjectUpdated={(project) => {
                  setSelectedProject(project);
                }}
              />
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
