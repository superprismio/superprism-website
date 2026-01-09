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
import { useProjectUpdate, useProject } from "@/hooks/useProjects";
import { useChat } from "@/hooks/useChat";
import type { Database } from "@/lib/types/supabase";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { generateShareUrl } from "@/lib/share-link";
import { ShareButton } from "./share-button";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; file_id: string[] };
  created_at: null;
};

export function SpaceProjects({
  heapId,
  projectId,
}: WorkspacePaneComponentProps) {
  const [selectedProject, setSelectedProject] = useState<
    ChatSession | PendingProject | null
  >(null);
  const updateProject = useProjectUpdate();
  const { setActiveChatSession } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch project if projectId is provided in URL
  const { data: urlProject } = useProject(heapId, projectId || null);

  // Update selected project when URL projectId changes
  useEffect(() => {
    if (projectId && urlProject) {
      // Only update if the selected project is different from the URL project
      const currentId =
        selectedProject && (selectedProject as ChatSession).id !== null
          ? (selectedProject as ChatSession).id
          : null;
      if (currentId !== projectId) {
        setSelectedProject(urlProject);
        setActiveChatSession(urlProject);
      }
    } else if (
      !projectId &&
      selectedProject &&
      (selectedProject as ChatSession).id !== null
    ) {
      // Clear selection if projectId is removed from URL
      setSelectedProject(null);
      setActiveChatSession(null);
    }
  }, [projectId, urlProject, setActiveChatSession]);

  // Update URL when project selection changes
  const updateUrlWithProject = useCallback(
    (project: ChatSession | PendingProject | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (project && project.id !== null) {
        params.set("projectId", project.id);
        // Ensure section is set to projects
        params.set("section", "projects");
      } else {
        params.delete("projectId");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Create or get pending project
  const getOrCreatePendingProject = useCallback((): PendingProject => {
    if (selectedProject && selectedProject.id === null) {
      return selectedProject as PendingProject;
    }
    return {
      id: null,
      title: "New Project",
      meta: { isProject: true, file_id: [] },
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
        const currentFileIds = (meta.file_id || []) as string[];

        // Don't add if already in the list
        if (currentFileIds.includes(fileId)) {
          return;
        }

        // Update the project with the new fileId
        const updatedFileIds = [...currentFileIds, fileId];
        const updatedMeta = {
          ...meta,
          file_id: updatedFileIds,
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
        if (!pending.meta.file_id.includes(fileId)) {
          const updatedPending: PendingProject = {
            ...pending,
            meta: {
              ...pending.meta,
              file_id: [...pending.meta.file_id, fileId],
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
            file_id: fileIds,
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
    updateUrlWithProject(null);
  }, [setActiveChatSession, updateUrlWithProject]);

  // Handle creating a new project
  const handleCreateNewProject = useCallback(() => {
    const pendingProject = getOrCreatePendingProject();
    setSelectedProject(pendingProject);
    setActiveChatSession(pendingProject);
    // Don't update URL for pending projects (no ID yet)
  }, [getOrCreatePendingProject, setActiveChatSession]);

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
        <Button
          size="sm"
          variant="outline"
          onClick={handleCreateNewProject}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </header>
      <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
        <ResizablePanel defaultSize={60} minSize={20}>
          {selectedProject ? (
            <ScrollArea className="flex-1 min-h-0 h-full">
              <ProjectDetail
                key={selectedProject.id}
                heapId={heapId}
                project={selectedProject}
                onUpdatePendingProject={handleUpdatePendingProject}
                onUpdatePendingProjectTitle={handleUpdatePendingProjectTitle}
                onProjectCreated={(project) => {
                  setSelectedProject(project);
                  setActiveChatSession(project);
                  updateUrlWithProject(project);
                }}
                onProjectUpdated={(project) => {
                  setSelectedProject(project);
                  setActiveChatSession(project);
                  updateUrlWithProject(project);
                }}
                onClose={handleCloseProject}
              />
            </ScrollArea>
          ) : (
            <ProjectList
              heapId={heapId}
              selectedProjectId={null}
              onSelectProject={(project) => {
                // Only set if it's a real project (not pending)
                if (project && project.id !== null) {
                  setSelectedProject(project);
                  setActiveChatSession(project);
                  updateUrlWithProject(project);
                }
              }}
            />
          )}
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
