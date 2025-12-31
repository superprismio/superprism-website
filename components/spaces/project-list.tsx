"use client";

import { useState, useMemo, useEffect } from "react";
import { useProjectList } from "@/hooks/useProjects";
import { useChat } from "@/hooks/useChat";
import type { Database } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";
import { Folder, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "../ui/scroll-area";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type ProjectListProps = {
  heapId: string;
  selectedProjectId: string | null;
  onSelectProject: (project: ChatSession | null) => void;
};

type FolderType = "your-projects" | "space-projects";

type ModeToggleProps = {
  mode: "explore" | "search";
  onChange: (mode: "explore" | "search") => void;
};

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="px-3 py-2 border-b flex gap-2">
      <button
        type="button"
        onClick={() => onChange("explore")}
        className={cn(
          "text-sm px-2 py-1 rounded",
          mode === "explore"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        Explore
      </button>
      <button
        type="button"
        onClick={() => onChange("search")}
        className={cn(
          "text-sm px-2 py-1 rounded",
          mode === "search"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        Search
      </button>
    </div>
  );
}

type FolderListProps = {
  activeFolder: FolderType | null;
  onSelectFolder: (folder: FolderType) => void;
  yourProjectsCount: number;
  spaceProjectsCount: number;
  className?: string;
};

function FolderList({
  activeFolder,
  onSelectFolder,
  yourProjectsCount,
  spaceProjectsCount,
  className,
}: FolderListProps) {
  return (
    <nav className={cn("space-y-0", className)}>
      <ul>
        <li>
          <button
            type="button"
            onClick={() => onSelectFolder("your-projects")}
            className={cn(
              "w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-muted transition",
              activeFolder === "your-projects" && "font-medium"
            )}
          >
            <span className="flex items-center gap-2">
              {activeFolder === "your-projects" ? (
                <FolderOpen
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Folder className="h-4 w-4" aria-hidden="true" />
              )}
              <span>Your Projects</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {yourProjectsCount}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => onSelectFolder("space-projects")}
            className={cn(
              "w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-muted transition",
              activeFolder === "space-projects" && "font-medium"
            )}
          >
            <span className="flex items-center gap-2">
              {activeFolder === "space-projects" ? (
                <FolderOpen
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Folder className="h-4 w-4" aria-hidden="true" />
              )}
              <span>Space Projects</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {spaceProjectsCount}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

type ProjectSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
  className?: string;
};

function ProjectSearch({
  search,
  onSearchChange,
  className,
}: ProjectSearchProps) {
  return (
    <aside className={cn("p-4 space-y-4 overflow-y-auto", className)}>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Search
        </label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects"
        />
      </div>
    </aside>
  );
}

type ProjectListContentProps = {
  projects: ChatSession[];
  selectedProjectId: string | null;
  onSelectProject: (project: ChatSession | null) => void;
  emptyMessage: string;
};

function ProjectListContent({
  projects,
  selectedProjectId,
  onSelectProject,
  emptyMessage,
}: ProjectListContentProps) {
  const { setActiveChatSession } = useChat();

  if (projects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-10">{emptyMessage}</div>
    );
  }

  return (
    <ul className="space-y-2 p-3">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;
        return (
          <li key={project.id} className="p-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectProject(project);
                  setActiveChatSession(project);
                }}
                className={cn(
                  "flex-1 text-left text-md font-medium hover:bg-muted transition px-2 py-1 rounded",
                  isSelected && "bg-muted"
                )}
              >
                <span className="truncate">
                  {project.title || "Untitled Project"}
                </span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectList({
  heapId,
  selectedProjectId,
  onSelectProject,
}: ProjectListProps) {
  const {
    data: projectFolders,
    isLoading,
    isError,
    error,
  } = useProjectList(heapId);
  const { setActiveChatSession } = useChat();
  const [mode, setMode] = useState<"explore" | "search">("explore");
  const [activeFolder, setActiveFolder] = useState<FolderType | null>(null);
  const [search, setSearch] = useState("");

  // Set default active folder
  useEffect(() => {
    if (activeFolder === null && projectFolders) {
      if (projectFolders.yourProjects.length > 0) {
        setActiveFolder("your-projects");
      } else if (projectFolders.spaceProjects.length > 0) {
        setActiveFolder("space-projects");
      }
    }
  }, [activeFolder, projectFolders]);

  // Clear active chat session when no project is selected
  useEffect(() => {
    if (selectedProjectId === null) {
      setActiveChatSession(null);
    }
  }, [selectedProjectId, setActiveChatSession]);

  const activeProjects = useMemo(() => {
    if (!projectFolders) return [];
    if (mode === "explore") {
      if (activeFolder === "your-projects") {
        return projectFolders.yourProjects;
      } else if (activeFolder === "space-projects") {
        return projectFolders.spaceProjects;
      }
      return [];
    } else {
      // Search mode - show all projects
      const allProjects = [
        ...projectFolders.yourProjects,
        ...projectFolders.spaceProjects,
      ];
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        return allProjects.filter((project) => {
          const title = (project.title || "").toLowerCase();
          return title.includes(query);
        });
      }
      return allProjects;
    }
  }, [projectFolders, mode, activeFolder, search]);

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

  if (!projectFolders) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No projects found. Create a new chat session to get started.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col sm:flex-row">
          <div className="sm:h-full sm:w-56 border-b sm:border-b-0 sm:border-r flex flex-col">
            <ModeToggle
              mode={mode}
              onChange={(nextMode) => setMode(nextMode)}
            />
            {mode === "explore" ? (
              <ScrollArea className="flex-1 min-h-0 h-full">
                <FolderList
                  activeFolder={activeFolder}
                  onSelectFolder={setActiveFolder}
                  yourProjectsCount={projectFolders.yourProjects.length}
                  spaceProjectsCount={projectFolders.spaceProjects.length}
                  className="flex-1 overflow-y-auto"
                />
              </ScrollArea>
            ) : (
              <ProjectSearch
                search={search}
                onSearchChange={setSearch}
                className="flex-1"
              />
            )}
          </div>
          <section className="flex-1 min-h-[220px] space-y-4 overflow-hidden flex flex-col">
            {mode === "explore" ? (
              activeFolder ? (
                  <ScrollArea className="flex-1 min-h-0 h-full">
                    <ProjectListContent
                      projects={activeProjects}
                      selectedProjectId={selectedProjectId}
                      onSelectProject={onSelectProject}
                      emptyMessage="No projects in this folder."
                    />
                  </ScrollArea>
              ) : (
                <div className="text-sm text-muted-foreground p-10">
                  Select a folder to view its projects.
                </div>
              )
            ) : (
                <ScrollArea className="flex-1 min-h-0 h-full">
                  <ProjectListContent
                    projects={activeProjects}
                    selectedProjectId={selectedProjectId}
                    onSelectProject={onSelectProject}
                    emptyMessage={
                      search
                        ? "No projects match your search."
                        : "Start by searching for a project."
                    }
                  />
                </ScrollArea>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
