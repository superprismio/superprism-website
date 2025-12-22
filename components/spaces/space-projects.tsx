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
import { KnowledgeExplorer } from "./knowledge-explorer";
import { useProjectUpdate } from "@/hooks/useProjects";
import { useChat } from "@/hooks/useChat";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; fileIds: string[] };
  created_at: null;
};

export function SpaceProjects({ heapId }: WorkspacePaneComponentProps) {
  const [selectedProject, setSelectedProject] = useState<
    ChatSession | PendingProject | null
  >(null);
  const updateProject = useProjectUpdate();
  const { setActiveChatSession } = useChat();

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

  // Handle adding file to project (existing or pending)
  const handleAddFileToProject = useCallback(
    async (fileId: string) => {
      // If there's a selected real project (not pending), add to it
      if (selectedProject && selectedProject.id !== null) {
        const project = selectedProject as ChatSession;
        const meta = (project.meta as Record<string, unknown>) || {};
        const currentFileIds = (meta.fileIds || meta.file_ids || []) as string[];
        
        // Don't add if already in the list
        if (currentFileIds.includes(fileId)) {
          return;
        }

        // Update the project with the new fileId
        const updatedFileIds = [...currentFileIds, fileId];
        const updatedMeta = {
          ...meta,
          fileIds: updatedFileIds,
        };

        try {
          const updatedProject = await updateProject.mutateAsync({
            heapId,
            sessionId: project.id,
            meta: updatedMeta,
          });
          setSelectedProject(updatedProject);
        } catch (error) {
          console.error("Failed to add file to project:", error);
        }
      } else {
        // No real project selected, create/update pending project
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
      }
    },
    [selectedProject, getOrCreatePendingProject, heapId, updateProject]
  );

  // Handle updating pending project fileIds
  const handleUpdatePendingProject = useCallback(
    (fileIds: string[]) => {
      if (selectedProject && selectedProject.id === null) {
        const updatedPending: PendingProject = {
          ...(selectedProject as PendingProject),
          meta: {
            ...(selectedProject as PendingProject).meta,
            fileIds,
          },
        };
        setSelectedProject(updatedPending);
      }
    },
    [selectedProject]
  );

  // Handle updating pending project title
  const handleUpdatePendingProjectTitle = useCallback(
    (title: string) => {
      if (selectedProject && selectedProject.id === null) {
        const updatedPending: PendingProject = {
          ...(selectedProject as PendingProject),
          title,
        };
        setSelectedProject(updatedPending);
      }
    },
    [selectedProject]
  );

  // Handle closing project detail
  const handleCloseProject = useCallback(() => {
    setSelectedProject(null);
    setActiveChatSession(null);
  }, [setActiveChatSession]);

  // Update active chat session when selected project changes
  useEffect(() => {
    setActiveChatSession(selectedProject);
  }, [selectedProject, setActiveChatSession]);

  // Expose handler to window for cross-pane communication
  useEffect(() => {
    (
      window as unknown as { addFileToProject?: (fileId: string) => void }
    ).addFileToProject = handleAddFileToProject;
    return () => {
      delete (
        window as unknown as { addFileToProject?: (fileId: string) => void }
      ).addFileToProject;
    };
  }, [handleAddFileToProject]);

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Projects</h3>
      </header>
      <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
        <ResizablePanel defaultSize={60} minSize={20}>
          <div className="h-full overflow-y-auto">
            {selectedProject ? (
              <ProjectDetail
                heapId={heapId}
                project={selectedProject}
                onUpdatePendingProject={handleUpdatePendingProject}
                onUpdatePendingProjectTitle={handleUpdatePendingProjectTitle}
                onProjectCreated={(project) => {
                  setSelectedProject(project);
                  setActiveChatSession(project);
                }}
                onProjectUpdated={(project) => {
                  setSelectedProject(project);
                  setActiveChatSession(project);
                }}
                onClose={handleCloseProject}
              />
            ) : (
              <ProjectList
                heapId={heapId}
                selectedProjectId={null}
                onSelectProject={(project) => {
                  // Only set if it's a real project (not pending)
                  if (project && project.id !== null) {
                    setSelectedProject(project);
                    setActiveChatSession(project);
                  }
                }}
              />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          {selectedProject ? (
            <KnowledgeExplorer heapId={heapId} useDialogForPreview={true} />
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Select a project to view details and add files
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
