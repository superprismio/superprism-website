"use client";

import { useState, useEffect } from "react";
import { useProjectUpdate } from "@/hooks/useProjects";
import type { Database } from "@/lib/types/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type ProjectDetailProps = {
  heapId: string;
  project: ChatSession | null;
};

export function ProjectDetail({ heapId, project }: ProjectDetailProps) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const updateProject = useProjectUpdate();

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setIsEditing(false);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a project to view details
      </div>
    );
  }

  const handleSave = async () => {
    if (!project || title.trim() === (project.title || "")) {
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
  };

  const handleCancel = () => {
    setTitle(project.title || "");
    setIsEditing(false);
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Name</label>
        {isEditing ? (
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Created</label>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {formatDate(project.created_at)}
        </div>
      </div>
    </div>
  );
}

