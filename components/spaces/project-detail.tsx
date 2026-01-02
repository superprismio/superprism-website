"use client";

import { useState, useEffect, useMemo } from "react";
import { useProjectUpdate, useCreateProject } from "@/hooks/useProjects";
import type { Database } from "@/lib/types/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectFileList } from "@/components/spaces/project-file-list";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { isOwnerOrProjectCreator } from "@/lib/auth-helpers";
import { useSpaceMembers } from "@/hooks/useMembers";
import { useProfile } from "@/hooks/useProfile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateShareUrl } from "@/lib/share-link";
import { ShareButton } from "./share-button";
import { X } from "lucide-react";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type PendingProject = {
  id: null;
  title: string;
  meta: { isProject: true; file_id: string[] };
  created_at: null;
};

type ProjectDetailProps = {
  heapId: string;
  project: ChatSession | PendingProject | null;
  onUpdatePendingProject?: (fileIds: string[]) => void;
  onUpdatePendingProjectTitle?: (title: string) => void;
  onProjectCreated?: (project: ChatSession) => void;
  onProjectUpdated?: (project: ChatSession) => void;
  onClose?: () => void;
};

export function ProjectDetail({
  heapId,
  project,
  onUpdatePendingProject,
  onUpdatePendingProjectTitle,
  onProjectCreated,
  onProjectUpdated,
  onClose,
}: ProjectDetailProps) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const updateProject = useProjectUpdate();
  const createProject = useCreateProject();
  const { data: members = [] } = useSpaceMembers(heapId);

  const isPending = project !== null && project.id === null;
  const isRealProject = project !== null && project.id !== null;
  const projectCreatorId = isRealProject
    ? (project as ChatSession).created_by
    : null;

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    void getCurrentUser();
  }, []);

  // Check if current user is heap owner/admin
  const isHeapOwner = useMemo(() => {
    if (!currentUserId) return false;
    const currentUserMembership = members.find(
      (m) => m.user_id === currentUserId
    );
    return (
      currentUserMembership?.role === "admin" ||
      currentUserMembership?.role === "owner"
    );
  }, [members, currentUserId]);

  // Check if current user can edit (must be owner or creator)
  const canEdit = useMemo(() => {
    if (isPending) return true; // Can always edit pending projects
    if (!isRealProject || !currentUserId || !projectCreatorId) return false;
    return isOwnerOrProjectCreator(
      currentUserId,
      projectCreatorId,
      isHeapOwner
    );
  }, [isPending, isRealProject, currentUserId, projectCreatorId, isHeapOwner]);

  // Fetch creator profile
  const { data: creatorProfile } = useProfile(projectCreatorId);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setIsEditing(false);
    }
  }, [project]);

  const fileIds = useMemo(() => {
    if (
      !project?.meta ||
      typeof project.meta !== "object" ||
      Array.isArray(project.meta)
    ) {
      return [];
    }
    const meta = project.meta as Record<string, unknown>;
    const ids = meta.file_id || [];
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

        setTitle(title.trim());
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

  const handleRemoveFile = async (fileId: string) => {
    if (!canEdit) return;

    if (isPending && onUpdatePendingProject) {
      const updatedFileIds = fileIds.filter((id) => id !== fileId);

      onUpdatePendingProject(updatedFileIds);
    } else if (project && !isPending) {
      // Update existing project's fileIds
      const updatedFileIds = fileIds.filter((id) => id !== fileId);
      const updatedMeta = {
        ...(project.meta as Record<string, unknown>),
        file_id: updatedFileIds,
      };
      try {
        const updatedProject = await updateProject.mutateAsync({
          heapId,
          sessionId: project.id,
          meta: updatedMeta,
        });
        if (onProjectUpdated) {
          onProjectUpdated(updatedProject);
        }
      } catch (error) {
        console.error("Failed to remove file:", error);
      }
    }
  };

  const handleArchive = async () => {
    if (!canEdit || !project || isPending) return;

    try {
      await updateProject.mutateAsync({
        heapId,
        sessionId: project.id,
        archived: true,
      });
      setIsArchiveDialogOpen(false);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  const handleClone = async () => {
    if (!project || isPending) return;

    try {
      const clonedTitle = `${project.title || "Untitled Project"} - Copy`;
      const clonedMeta = project.meta
        ? (JSON.parse(JSON.stringify(project.meta)) as Record<string, unknown>)
        : { isProject: true, file_id: [] };
      const clonedFilter = (project as ChatSession).filter
        ? JSON.parse(JSON.stringify((project as ChatSession).filter))
        : undefined;

      const clonedProject = await createProject.mutateAsync({
        heapId,
        title: clonedTitle,
        meta: clonedMeta,
        filter: clonedFilter,
      });

      if (onProjectCreated) {
        onProjectCreated(clonedProject);
      }
    } catch (error) {
      console.error("Failed to clone project:", error);
    }
  };

  return (
    <div
      className="holographic-shimmer h-full"
      id={`project-detail-${project.id ?? "pending"}`}
    >
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;
              {project?.title || "this project"}&quot;? Archived projects will
              be hidden from the project list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
              disabled={updateProject.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchive}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
        <h4 className="text-sm font-medium">Project Detail</h4>
        <div className="flex items-center gap-2">
          {isRealProject && (
            <ShareButton
              url={generateShareUrl(heapId, {
                section: "projects",
                projectId: project.id,
              })}
              size="sm"
            />
          )}
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {onClose && (
          <div className="flex justify-end mb-1 gap-2">
            {isRealProject && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClone}
                disabled={createProject.isPending}
              >
                {createProject.isPending ? "Cloning..." : "Clone Project"}
              </Button>
            )}
            {canEdit && !isPending && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsArchiveDialogOpen(true)}
              >
                Remove
              </Button>
            )}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Name</label>
          {isPending ? (
            <Input
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                if (onUpdatePendingProjectTitle) {
                  onUpdatePendingProjectTitle(newTitle);
                }
              }}
              placeholder="New Project"
              className="h-8 text-sm"
            />
          ) : isEditing ? (
            <div className="space-y-1.5">
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
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                  className="h-7 text-xs"
                >
                  {updateProject.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProject.isPending}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "px-2 py-1.5 border border-transparent rounded-md min-h-[32px] flex items-center text-sm",
                canEdit && "hover:border-border cursor-text"
              )}
              onClick={() => canEdit && setIsEditing(true)}
            >
              {title || project.title || "Untitled Project"}
            </div>
          )}
        </div>

        {!isPending && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Created
              </label>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {formatDate(project.created_at)}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Created by
              </label>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {creatorProfile?.name ||
                  creatorProfile?.user_id ||
                  projectCreatorId ||
                  "Unknown"}
              </div>
            </div>
          </>
        )}

        {(fileIds.length > 0 || isPending) && (
          <ProjectFileList
            heapId={heapId}
            fileIds={fileIds}
            onRemoveFile={canEdit ? handleRemoveFile : undefined}
          />
        )}

        {isPending && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={createProject.isPending}
              className="h-7 text-xs"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
