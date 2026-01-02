"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  Ellipsis,
} from "lucide-react";
import { useSpaceFiles, type FolderNode } from "@/hooks/useSpaceFiles";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { FileRow } from "./types";
import { createClient } from "@/lib/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareButton } from "./share-button";
import { generateShareUrl } from "@/lib/share-link";
import { useSpaceMembers } from "@/hooks/useMembers";
import { isOwnerOrFileCreator } from "@/lib/auth-helpers";

type FileExplorerProps = {
  heapId: string;
  onPreviewFile?: (file: FileRow) => void;
  onAddFileToChat?: (file: FileRow) => void;
  onDeleteFile?: (fileId: string) => Promise<void>;
  selectedFileId?: string | null;
  useDialogForPreview?: boolean;
};

type FolderSelection = {
  label: string;
  path: string;
  files: FileRow[];
};

type FileListProps = {
  files: FileRow[];
  emptyMessage: string;
  selectedFileId?: string | null;
  onAddToChat?: (file: FileRow) => void;
  onPreview?: (file: FileRow) => void;
  onDeleteFile?: (fileId: string) => Promise<void>;
  isStaging?: boolean;
  onMoveToFolder?: (fileId: string, folders: string[]) => Promise<void>;
  currentUserId?: string | null;
  heapId: string;
  useDialogForPreview?: boolean;
};

const LOCAL_FOLDER_OPTIONS = [
  { value: "artifacts", label: "Artifacts", folders: ["artifacts"] },
  { value: "summaries", label: "Summaries", folders: ["summaries"] },
  {
    value: "summaries-meetings",
    label: "Summaries > Meetings",
    folders: ["summaries", "meetings"],
  },
  { value: "documents", label: "Documents", folders: ["documents"] },
  { value: "notes", label: "Notes", folders: ["notes"] },
];

function getFileIcon(storagePath: string | null | undefined) {
  if (!storagePath) {
    return File;
  }

  const extension = storagePath.split(".").pop()?.toLowerCase();

  if (extension === "txt" || extension === "md") {
    return FileText;
  }

  if (["png", "jpg", "jpeg", "svg"].includes(extension || "")) {
    return FileImage;
  }

  if (["csv", "xlsx", "xls"].includes(extension || "")) {
    return FileSpreadsheet;
  }

  return File;
}

function getTotalFileCount(
  folder: FolderNode,
  filesByFolder: Record<string, FileRow[]>
): number {
  let count = filesByFolder[folder.path]?.length ?? 0;

  if (folder.children) {
    for (const child of folder.children) {
      count += getTotalFileCount(child, filesByFolder);
    }
  }

  return count;
}

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

function FileList({
  files,
  emptyMessage,
  selectedFileId,
  onAddToChat,
  onPreview,
  onDeleteFile,
  isStaging = false,
  onMoveToFolder,
  heapId,
  currentUserId,
}: FileListProps) {
  const [movingFileId, setMovingFileId] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rawFileId, setRawFileId] = useState<string | null>(null);
  const [isRawDialogOpen, setIsRawDialogOpen] = useState(false);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);
  const { data: members = [] } = useSpaceMembers(heapId);
  const { fetchRawFileContent } = useSpaceFiles(heapId);

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

  const handleMoveToFolder = async (fileId: string, folders: string[]) => {
    if (!onMoveToFolder) return;
    setMovingFileId(fileId);
    try {
      await onMoveToFolder(fileId, folders);
    } finally {
      setMovingFileId(null);
    }
  };

  const handleDeleteClick = (file: FileRow) => {
    setDeleteFileId(file.id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteFileId || !onDeleteFile) return;
    setIsDeleting(true);
    try {
      await onDeleteFile(deleteFileId);
      setIsDeleteDialogOpen(false);
      setDeleteFileId(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewRaw = async (file: FileRow) => {
    if (!file?.id) return;

    setIsLoadingRaw(true);
    setRawFileId(file.id);
    setIsRawDialogOpen(true);

    try {
      const content = await fetchRawFileContent(file.id);
      setRawContent(content);
    } catch (error) {
      console.error("Error fetching raw file:", error);
      setRawContent("Error loading file content");
    } finally {
      setIsLoadingRaw(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-10">{emptyMessage}</div>
    );
  }

  return (
    <>
      <ul className="space-y-2 p-3">
        {files.map((file) => {
          const FileIcon = getFileIcon(
            (file as FileRow & { storage_path?: string | null }).storage_path
          );
          const isSelected = selectedFileId === file.id;
          const canDelete =
            file &&
            isOwnerOrFileCreator(
              currentUserId,
              file.uploader_id,
              isHeapOwner
            ) &&
            onDeleteFile;
          const canViewRaw = file?.meta?.extracted_storage_path !== undefined;

          return (
            <li key={file.id} className="p-1">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "flex-1 text-left text-md font-medium px-2 py-1 rounded flex gap-2 items-center",
                    isSelected && "bg-muted"
                  )}
                >
                  <FileIcon className="h-6 w-6 shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">
                      {file.file_name ?? "Untitled file"}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {formatDate(file.uploaded_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isStaging && (
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const option = LOCAL_FOLDER_OPTIONS.find(
                          (opt) => opt.value === value
                        );
                        if (option) {
                          void handleMoveToFolder(file.id, option.folders);
                        }
                      }}
                      disabled={movingFileId === file.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Move to folder..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {LOCAL_FOLDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 hover:bg-muted rounded transition"
                        aria-label="File menu"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem onClick={() => onPreview?.(file)}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddToChat?.(file)}>
                        Add to Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(file)}
                        disabled={!canDelete}
                      >
                        Remove
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewRaw(file)}
                        disabled={!canViewRaw}
                      >
                        View Raw
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Share{" "}
                        <ShareButton
                          url={generateShareUrl(heapId, {
                            section: "knowledge",
                            fileId: file.id,
                          })}
                          size="sm"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {files.find((f) => f.id === deleteFileId)?.file_name ||
                deleteFileId}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteFileId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRawDialogOpen} onOpenChange={setIsRawDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Raw Content -{" "}
              {files.find((f) => f.id === rawFileId)?.file_name || rawFileId}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            {isLoadingRaw ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-4 rounded">
                {rawContent ?? "No content available"}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type FolderListProps = {
  folders: ReturnType<typeof useSpaceFiles>["folders"];
  filesByFolder: ReturnType<typeof useSpaceFiles>["filesByFolder"];
  openParent: string | null;
  activePath: string | null;
  onToggleParent: (path: string) => void;
  onSelectFolder: (path: string) => void;
  className?: string;
};

function FolderList({
  folders,
  filesByFolder,
  openParent,
  activePath,
  onToggleParent,
  onSelectFolder,
  className,
}: FolderListProps) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <nav className="space-y-0">
        <ul>
          {folders.map((folder) => {
            const parentOpen = openParent === folder.path;
            const hasChildren = folder.children && folder.children.length > 0;
            const isStaging = !hasChildren;
            const isActive = isStaging && activePath === folder.path;

            return (
              <li key={folder.path}>
                {isStaging ? (
                  <button
                    type="button"
                    onClick={() => onSelectFolder(folder.path)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-muted transition",
                      isActive && "font-medium"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isActive ? (
                        <FolderOpen
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Folder className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{folder.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getTotalFileCount(folder, filesByFolder)}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggleParent(folder.path)}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-muted transition"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {parentOpen ? (
                          <FolderOpen
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                          />
                        ) : (
                          <Folder className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>{folder.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getTotalFileCount(folder, filesByFolder)}
                      </span>
                    </button>
                    {parentOpen && folder.children?.length ? (
                      <ul className="bg-background">
                        {folder.children.map((child) => {
                          const hasGrandchildren =
                            child.children && child.children.length > 0;
                          const childPath = child.path;
                          const isChildActive = activePath === childPath;
                          const childFileCount = getTotalFileCount(
                            child,
                            filesByFolder
                          );

                          return (
                            <li key={child.path}>
                              <button
                                type="button"
                                onClick={() => onSelectFolder(childPath)}
                                className={cn(
                                  "w-full text-left px-6 py-2 text-sm flex items-center justify-between hover:bg-muted",
                                  isChildActive && "font-medium"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {isChildActive ? (
                                    <FolderOpen
                                      className="h-4 w-4 text-primary"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Folder
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span>{child.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {childFileCount}
                                </span>
                              </button>
                              {hasGrandchildren && child.children ? (
                                <ul className="bg-background">
                                  {child.children.map((grandchild) => {
                                    const path = grandchild.path;
                                    const isActive = activePath === path;
                                    const fileCount = getTotalFileCount(
                                      grandchild,
                                      filesByFolder
                                    );
                                    return (
                                      <li key={path}>
                                        <button
                                          type="button"
                                          onClick={() => onSelectFolder(path)}
                                          className={cn(
                                            "w-full text-left px-8 py-2 text-sm flex items-center justify-between hover:bg-muted",
                                            isActive && "font-medium"
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            {isActive ? (
                                              <FolderOpen
                                                className="h-4 w-4 text-primary"
                                                aria-hidden="true"
                                              />
                                            ) : (
                                              <Folder
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                              />
                                            )}
                                            <span>{grandchild.name}</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {fileCount}
                                          </span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </ScrollArea>
  );
}

type FileSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  activeTag: string | null;
  onToggleTag: (tag: string | null) => void;
  className?: string;
};

function FileSearch({
  search,
  onSearchChange,
  tags,
  activeTag,
  onToggleTag,
  className,
}: FileSearchProps) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <aside className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search files"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Tags</div>
          {tags.length === 0 ? (
            <div className="text-xs text-muted-foreground">No tags yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(isActive ? null : tag)}
                    className={cn(
                      "text-xs px-2 py-1 rounded border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
          {activeTag ? (
            <button
              type="button"
              onClick={() => onToggleTag(null)}
              className="text-xs text-primary hover:underline"
            >
              Clear tag filter
            </button>
          ) : null}
        </div>
      </aside>
    </ScrollArea>
  );
}

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

export function FileExplorer({
  heapId,
  onPreviewFile,
  onAddFileToChat,
  onDeleteFile,
  selectedFileId,
  useDialogForPreview = false,
}: FileExplorerProps) {
  const {
    folders,
    filesByFolder,
    files,
    tags,
    isLoading,
    isError,
    error,
    refetch,
    updateFileFolders,
  } = useSpaceFiles(heapId);
  const [openParent, setOpenParent] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [mode, setMode] = useState<"explore" | "search">("explore");
  const [search, setSearch] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "name-asc" | "name-desc" | "date-asc" | "date-desc"
  >("name-asc");

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

  const isStaging = activePath === "staging";

  const selectableFolders = useMemo(() => {
    const entries: FolderSelection[] = [];

    for (const parent of folders) {
      if (parent.children?.length) {
        // Handle folders with children (Public, Local)
        for (const child of parent.children) {
          // Include intermediate folders (e.g., Summaries) as selectable
          entries.push({
            label: `${parent.name} / ${child.name}`,
            path: child.path,
            files: filesByFolder[child.path] ?? [],
          });

          // Handle nested children (e.g., Summaries/Meetings)
          if (child.children?.length) {
            for (const grandchild of child.children) {
              entries.push({
                label: `${parent.name} / ${child.name} / ${grandchild.name}`,
                path: grandchild.path,
                files: filesByFolder[grandchild.path] ?? [],
              });
            }
          }
        }
      } else {
        // Handle folders without children (Staging)
        entries.push({
          label: parent.name,
          path: parent.path,
          files: filesByFolder[parent.path] ?? [],
        });
      }
    }

    return entries;
  }, [folders, filesByFolder]);

  useEffect(() => {
    if (activePath) {
      return;
    }

    const firstWithFiles = selectableFolders.find(
      (entry) => entry.files.length > 0
    );

    const fallback = selectableFolders[0];
    const preferred = firstWithFiles ?? fallback;

    if (preferred) {
      setActivePath(preferred.path);
      setOpenParent(preferred.path.split("/")[0] ?? null);
    }
  }, [selectableFolders, activePath]);

  const activeFolder = useMemo(() => {
    if (!activePath) return null;
    return selectableFolders.find((entry) => entry.path === activePath) ?? null;
  }, [selectableFolders, activePath]);

  const filteredFiles = useMemo(() => {
    let result = files;
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((file) => {
        const name = (file.file_name ?? "").toLowerCase();
        return name.includes(query);
      });
    }

    if (activeTagFilter) {
      result = result.filter((file) => {
        const metaTags = file.meta?.tags;
        return Array.isArray(metaTags)
          ? metaTags.includes(activeTagFilter)
          : false;
      });
    }

    // Apply sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const nameA = (a.file_name || "Untitled file").toLowerCase();
        const nameB = (b.file_name || "Untitled file").toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return sortBy === "name-asc" ? comparison : -comparison;
      } else {
        // Date sorting
        const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
        const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
        return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return sorted;
  }, [files, search, activeTagFilter, sortBy]);

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
                  folders={folders}
                  filesByFolder={filesByFolder}
                  openParent={openParent}
                  activePath={activePath}
                  onToggleParent={(path) =>
                    setOpenParent((prev) => (prev === path ? null : path))
                  }
                  onSelectFolder={(path) => {
                    setActivePath(path);
                    // Ensure parent folder is opened
                    const topLevelParent = path.split("/")[0];
                    if (topLevelParent) {
                      setOpenParent(topLevelParent);
                    }
                  }}
                  className="flex-1"
                />
              </ScrollArea>
            ) : (
              <FileSearch
                search={search}
                onSearchChange={setSearch}
                tags={tags}
                activeTag={activeTagFilter}
                onToggleTag={setActiveTagFilter}
                className="flex-1"
              />
            )}
          </div>
          <section className="flex-1 min-h-[220px] space-y-4 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="text-sm text-muted-foreground p-10">
                Loading files…
              </div>
            ) : null}
            {isError ? (
              <div className="space-y-2">
                <div className="text-sm text-destructive">
                  {error?.message ?? "Unable to load files"}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Try again
                </button>
              </div>
            ) : null}
            {!isLoading && !isError ? (
              <>
                <div className="px-3 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Files</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as typeof sortBy)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
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
                      <FileList
                        files={(() => {
                          // Apply sorting to active folder files
                          const sorted = [...activeFolder.files].sort(
                            (a, b) => {
                              if (
                                sortBy === "name-asc" ||
                                sortBy === "name-desc"
                              ) {
                                const nameA = (
                                  a.file_name || "Untitled file"
                                ).toLowerCase();
                                const nameB = (
                                  b.file_name || "Untitled file"
                                ).toLowerCase();
                                const comparison = nameA.localeCompare(nameB);
                                return sortBy === "name-asc"
                                  ? comparison
                                  : -comparison;
                              } else {
                                const dateA = a.uploaded_at
                                  ? new Date(a.uploaded_at).getTime()
                                  : 0;
                                const dateB = b.uploaded_at
                                  ? new Date(b.uploaded_at).getTime()
                                  : 0;
                                return sortBy === "date-asc"
                                  ? dateA - dateB
                                  : dateB - dateA;
                              }
                            }
                          );
                          return sorted;
                        })()}
                        emptyMessage="Ingestion before digestion"
                        selectedFileId={selectedFileId}
                        onAddToChat={onAddFileToChat}
                        onPreview={onPreviewFile}
                        onDeleteFile={onDeleteFile}
                        isStaging={isStaging}
                        onMoveToFolder={
                          isStaging ? updateFileFolders : undefined
                        }
                        currentUserId={currentUserId}
                        heapId={heapId}
                        useDialogForPreview={useDialogForPreview}
                      />
                    </ScrollArea>
                  ) : (
                    <div className="text-sm text-muted-foreground p-10">
                      Select a folder to view its files.
                    </div>
                  )
                ) : (
                  <ScrollArea className="flex-1 min-h-0 h-full">
                    <FileList
                      files={filteredFiles}
                      emptyMessage={
                        search || activeTagFilter
                          ? "No files match your filters."
                          : "Start by searching or selecting a tag."
                      }
                      selectedFileId={selectedFileId}
                      onAddToChat={onAddFileToChat}
                      onPreview={onPreviewFile}
                      onDeleteFile={onDeleteFile}
                      currentUserId={currentUserId}
                      heapId={heapId}
                      useDialogForPreview={useDialogForPreview}
                    />
                  </ScrollArea>
                )}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
