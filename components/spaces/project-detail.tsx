"use client";

import { useState, useEffect, useMemo } from "react";
import { useProjectUpdate, useCreateProject } from "@/hooks/useProjects";
import type { Database } from "@/lib/types/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectFileList } from "@/components/spaces/project-file-list";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; fileIds: string[] };
  created_at: null;
};

type ProjectDetailProps = {
  heapId: string;
  project: ChatSession | PendingProject | null;
  onUpdatePendingProject?: (fileIds: string[]) => void;
  onProjectCreated?: (project: ChatSession) => void;
};

export function ProjectDetail({ heapId, project, onUpdatePendingProject, onProjectCreated }: ProjectDetailProps) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const updateProject = useProjectUpdate();
  const createProject = useCreateProject();

  const isPending = project !== null && project.id === null;

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setIsEditing(false);
    }
  }, [project]);

  const fileIds = useMemo(() => {
    if (!project?.meta || typeof project.meta !== "object" || Array.isArray(project.meta)) {
      return [];
    }
    const meta = project.meta as Record<string, unknown>;
    const ids = meta.fileIds || meta.file_ids;
    if (Array.isArray(ids)) {
      return ids.filter((id): id is string => typeof id === "string");
    }
    return [];
  }, [project?.meta]);

  if (!project) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a project to view details
      </div>
    );
  }

  const handleSave = async () => {
    if (!project) return;

    if (isPending) {
      // Create new project
      try {
        const newProject = await createProject.mutateAsync({
          heapId,
          title: title.trim() || "New Project",
          fileIds,
        });
        if (onProjectCreated) {
          onProjectCreated(newProject);
        }
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    } else {
      // Update existing project
      if (title.trim() === (project.title || "")) {
        setIsEditing(false);
        return;
      }

      try {
        await updateProject.mutateAsync({
          heapId,
          sessionId: project.id,
          title: title.trim(),
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update project:", error);
      }
    }
  };

  const handleCancel = () => {
    if (project) {
      setTitle(project.title || "");
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (isPending && onUpdatePendingProject) {
      const updatedFileIds = fileIds.filter((id) => id !== fileId);
      onUpdatePendingProject(updatedFileIds);
    } else if (project && !isPending) {
      // Update existing project's fileIds
      const updatedFileIds = fileIds.filter((id) => id !== fileId);
      const updatedMeta = {
        ...(project.meta as Record<string, unknown>),
        fileIds: updatedFileIds,
      };
      updateProject.mutate({
        heapId,
        sessionId: project.id,
        meta: updatedMeta,
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Name</label>
        {isPending ? (
          <div className="px-3 py-2 border border-border rounded-md min-h-[36px] flex items-center text-muted-foreground">
            {title || "New Project"}
          </div>
        ) : isEditing ? (
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              disabled={updateProject.isPending}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateProject.isPending}
              >
                {updateProject.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={updateProject.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="px-3 py-2 border border-transparent rounded-md hover:border-border cursor-text min-h-[36px] flex items-center"
            onClick={() => setIsEditing(true)}
          >
            {project.title || "Untitled Project"}
          </div>
        )}
      </div>

      {!isPending && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Created</label>
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {formatDate(project.created_at)}
          </div>
        </div>
      )}

      {(fileIds.length > 0 || isPending) && (
        <ProjectFileList
          heapId={heapId}
          fileIds={fileIds}
          onRemoveFile={handleRemoveFile}
        />
      )}

      {isPending && (
        <div className="flex gap-2 pt-4">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={createProject.isPending}
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      )}
    </div>
  );
}

