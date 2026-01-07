"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useProjectList,
  useProjectUpdate,
  useCreateProject,
} from "@/hooks/useProjects";
import { useChat, useSendChatMessage } from "@/hooks/useChat";
import { useSpaceMembers } from "@/hooks/useMembers";
import type { Database } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";
import { Folder, FolderOpen, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isOwnerOrProjectCreator } from "@/lib/auth-helpers";
import { generateShareUrl } from "@/lib/share-link";
import { ShareButton } from "./share-button";

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
  heapId: string;
  projects: ChatSession[];
  selectedProjectId: string | null;
  onSelectProject: (project: ChatSession | null) => void;
  emptyMessage: string;
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ProjectListContent({
  heapId,
  projects,
  selectedProjectId,
  onSelectProject,
  emptyMessage,
}: ProjectListContentProps) {
  const { setActiveChatSession } = useChat();
  const updateProject = useProjectUpdate();
  const createProject = useCreateProject();
  const sendChatMessage = useSendChatMessage(heapId);
  const { data: members = [] } = useSpaceMembers(heapId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<ChatSession | null>(
    null
  );

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

  const handleOpen = (project: ChatSession) => {
    onSelectProject(project);
    setActiveChatSession(project);
  };

  const handleArchiveClick = (project: ChatSession) => {
    setProjectToArchive(project);
    setIsArchiveDialogOpen(true);
  };

  const handleArchive = async () => {
    if (!projectToArchive) return;

    try {
      await updateProject.mutateAsync({
        heapId,
        sessionId: projectToArchive.id,
        archived: true,
      });
      setIsArchiveDialogOpen(false);
      setProjectToArchive(null);
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  const handleClone = async (project: ChatSession) => {
    try {
      const originalSessionId = project.id;
      const clonedTitle = `${project.title || "Untitled Project"} - Copy`;
      const clonedMeta = project.meta
        ? (JSON.parse(JSON.stringify(project.meta)) as Record<string, unknown>)
        : { isProject: true, file_id: [] };
      const clonedFilter = project.filter
        ? JSON.parse(JSON.stringify(project.filter))
        : undefined;

      const clonedProject = await createProject.mutateAsync({
        heapId,
        title: clonedTitle,
        meta: clonedMeta,
        filter: clonedFilter,
      });

      onSelectProject(clonedProject);
      setActiveChatSession(clonedProject);

      // Send summary request in the background using the cloned project's sessionId
      if (originalSessionId && clonedProject.id) {
        sendChatMessage.mutate(
          {
            chatInput: `can you summarize the chat with session id ${originalSessionId}`,
            sessionId: clonedProject.id,
          },
          {
            onError: (error) => {
              console.error("Failed to send summary request:", error);
            },
          }
        );
      }
    } catch (error) {
      console.error("Failed to clone project:", error);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-10">{emptyMessage}</div>
    );
  }

  return (
    <>
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;
              {projectToArchive?.title || "this project"}&quot;? Archived
              projects will be hidden from the project list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsArchiveDialogOpen(false);
                setProjectToArchive(null);
              }}
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
      <ul className="space-y-2 p-3">
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const canArchive = isOwnerOrProjectCreator(
            currentUserId,
            project.created_by,
            isHeapOwner
          );
          return (
            <li key={project.id} className="p-1 pr-4">
              <div className="flex items-center justify-between gap-2 hover:bg-muted rounded transition">
                <div
                  className={cn(
                    "flex-1 text-left text-md font-medium px-2 py-1 rounded",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate">
                      {project.title || "Untitled Project"}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-1 hover:bg-muted rounded transition"
                      aria-label="Project menu"
                    >
                      <ChevronDown className="h-6 w-6 text-primary" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuItem onClick={() => handleOpen(project)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleArchiveClick(project)}
                      disabled={!canArchive}
                    >
                      Remove
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleClone(project)}>
                      Fork
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Share{" "}
                      <ShareButton
                        url={generateShareUrl(heapId, {
                          section: "projects",
                          projectId: project.id,
                        })}
                        size="sm"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>
    </>
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
  const [sortBy, setSortBy] = useState<
    "name-asc" | "name-desc" | "date-asc" | "date-desc"
  >("name-asc");

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
    let projects: ChatSession[] = [];

    if (mode === "explore") {
      if (activeFolder === "your-projects") {
        projects = projectFolders.yourProjects;
      } else if (activeFolder === "space-projects") {
        projects = projectFolders.spaceProjects;
      }
    } else {
      // Search mode - show all projects
      const allProjects = [
        ...projectFolders.yourProjects,
        ...projectFolders.spaceProjects,
      ];
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        projects = allProjects.filter((project) => {
          const title = (project.title || "").toLowerCase();
          return title.includes(query);
        });
      } else {
        projects = allProjects;
      }
    }

    // Apply sorting
    const sorted = [...projects].sort((a, b) => {
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const titleA = (a.title || "Untitled Project").toLowerCase();
        const titleB = (b.title || "Untitled Project").toLowerCase();
        const comparison = titleA.localeCompare(titleB);
        return sortBy === "name-asc" ? comparison : -comparison;
      } else {
        // Date sorting
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return sorted;
  }, [projectFolders, mode, activeFolder, search, sortBy]);

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
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Projects</span>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger className="w-[180px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === "explore" ? (
              activeFolder ? (
                <ScrollArea className="flex-1 min-h-0 h-full">
                  <ProjectListContent
                    heapId={heapId}
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
                  heapId={heapId}
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
