"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Binoculars,
  Folder,
  FolderOpen,
  MessageCirclePlus,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FileRow } from "./types";

type FileExplorerProps = {
  heapId: string;
  onPreviewFile?: (file: FileRow) => void;
  onAddFileToChat?: (file: FileRow) => void;
  selectedFileId?: string | null;
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
  isStaging?: boolean;
  onMoveToFolder?: (fileId: string, folders: string[]) => Promise<void>;
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

function FileList({
  files,
  emptyMessage,
  selectedFileId,
  onAddToChat,
  onPreview,
  isStaging = false,
  onMoveToFolder,
}: FileListProps) {
  const [movingFileId, setMovingFileId] = useState<string | null>(null);

  const handleMoveToFolder = async (fileId: string, folders: string[]) => {
    if (!onMoveToFolder) return;
    setMovingFileId(fileId);
    try {
      await onMoveToFolder(fileId, folders);
    } finally {
      setMovingFileId(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-10">{emptyMessage}</div>
    );
  }

  return (
    <ul className="space-y-2 p-3">
      {files.map((file) => {
        const FileIcon = getFileIcon(
          (file as FileRow & { storage_path?: string | null }).storage_path
        );
        return (
          <li key={file.id} className="p-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="text-md font-medium flex items-center gap-2">
                  <FileIcon className="h-4 w-4 shrink-0" />
                  {file.file_name ?? "Untitled file"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isStaging ? (
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
                    <SelectContent>
                      {LOCAL_FOLDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddToChat?.(file)}
                  >
                    <MessageCirclePlus />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onPreview?.(file)}
                  aria-pressed={selectedFileId === file.id}
                >
                  <Binoculars />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
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
    <nav className={cn("space-y-0", className)}>
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
                    {filesByFolder[folder.path]?.length ?? 0}
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
                  </button>
                  {parentOpen && folder.children?.length ? (
                    <ul className="bg-background">
                      {folder.children.map((child) => {
                        const hasGrandchildren =
                          child.children && child.children.length > 0;
                        const childPath = child.path;
                        const isChildActive = activePath === childPath;
                        const childFileCount =
                          filesByFolder[childPath]?.length ?? 0;

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
                                  const fileCount =
                                    filesByFolder[path]?.length ?? 0;
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
    <aside className={cn("p-4 space-y-4 overflow-y-auto", className)}>
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
  selectedFileId,
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
  } = useSpaceFiles(heapId);
  const queryClient = useQueryClient();
  const [openParent, setOpenParent] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [mode, setMode] = useState<"explore" | "search">("explore");
  const [search, setSearch] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const handleMoveToFolder = async (fileId: string, folders: string[]) => {
    try {
      const response = await fetch(`/api/heaps/${heapId}/files/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folders }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to move file");
      }

      // Invalidate and refetch files
      await queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    } catch (error) {
      console.error("Failed to move file:", error);
      throw error;
    }
  };

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

    return result;
  }, [files, search, activeTagFilter]);

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
                className="flex-1 overflow-y-auto"
              />
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
              mode === "explore" ? (
                activeFolder ? (
                  <>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <FileList
                        files={activeFolder.files}
                        emptyMessage="Ingestion before digestion"
                        selectedFileId={selectedFileId}
                        onAddToChat={onAddFileToChat}
                        onPreview={onPreviewFile}
                        isStaging={isStaging}
                        onMoveToFolder={
                          isStaging ? handleMoveToFolder : undefined
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground p-10">
                    Select a folder to view its files.
                  </div>
                )
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
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
                  />
                </div>
              )
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
