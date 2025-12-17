"use client";

import { useProjectList } from "@/hooks/useProjects";
import type { Database } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type ProjectListProps = {
  heapId: string;
  selectedProjectId: string | null;
  onSelectProject: (project: ChatSession | null) => void;
};

export function ProjectList({
  heapId,
  selectedProjectId,
  onSelectProject,
}: ProjectListProps) {
  const { data: projects, isLoading, isError, error } = useProjectList(heapId);

  console.log("projects", projects);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive">
        {error?.message || "Failed to load projects"}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No projects found. Create a new chat session to get started.
      </div>
    );
  }

  console.log("projects", projects);

  return (
    <div className="h-full overflow-y-auto">
      <ul className="space-y-0">
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          return (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => onSelectProject(project)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-muted transition",
                  isSelected && "bg-muted font-medium"
                )}
              >
                <span className="truncate flex-1">
                  {project.title || "Untitled Project"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
