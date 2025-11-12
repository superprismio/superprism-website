"use client";

import { useEffect, useMemo, useState } from "react";
import { Folder, FolderOpen } from "lucide-react";
import { FileRow } from "@/components/heaps/types";
import { useSpaceFiles } from "@/src/hooks/useSpaceFiles";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FileExplorerProps = {
  heapId: string;
};

type FolderSelection = {
  label: string;
  path: string;
  files: FileRow[];
};

type FileListProps = {
  files: FileRow[];
  emptyMessage: string;
};

function FileList({ files, emptyMessage }: FileListProps) {
  if (files.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.id} className="p-3">
          <div className="text-sm font-medium">
            {file.file_name ?? "Untitled file"}
          </div>
          {file.meta?.summary_short ? (
            <p className="text-xs text-muted-foreground mt-1">
              {file.meta.summary_short}
            </p>
          ) : null}
        </li>
      ))}
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
};

function FolderList({
  folders,
  filesByFolder,
  openParent,
  activePath,
  onToggleParent,
  onSelectFolder,
}: FolderListProps) {
  return (
    <nav className="sm:w-56 border-r">
      <ul>
        {folders.map((folder) => {
          const parentOpen = openParent === folder.path;
          return (
            <li key={folder.path}>
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
                    const path = child.path;
                    const isActive = activePath === path;
                    const fileCount = filesByFolder[path]?.length ?? 0;
                    return (
                      <li key={path}>
                        <button
                          type="button"
                          onClick={() => onSelectFolder(path)}
                          className={cn(
                            "w-full text-left px-6 py-2 text-sm flex items-center justify-between hover:bg-muted",
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
                              <Folder className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>{child.name}</span>
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
    </nav>
  );
}

type FileSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  activeTag: string | null;
  onToggleTag: (tag: string | null) => void;
};

function FileSearch({
  search,
  onSearchChange,
  tags,
  activeTag,
  onToggleTag,
}: FileSearchProps) {
  return (
    <aside className="sm:w-56 border-r p-4 space-y-4">
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

export function FileExplorer({ heapId }: FileExplorerProps) {
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
  const [openParent, setOpenParent] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [mode, setMode] = useState<"explore" | "search">("explore");
  const [search, setSearch] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const selectableFolders = useMemo(() => {
    const entries: FolderSelection[] = [];

    for (const parent of folders) {
      if (!parent.children?.length) continue;
      for (const child of parent.children) {
        entries.push({
          label: `${parent.name} / ${child.name}`,
          path: child.path,
          files: filesByFolder[child.path] ?? [],
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
    <div className="border rounded-lg overflow-hidden">
      <header className="gap-3 border-b w-full px-3 py-4 flex items-center">
        <div className="flex-1 text-sm font-medium">Knowledge files</div>
        <button
          type="button"
          onClick={() => setMode("explore")}
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
          onClick={() => setMode("search")}
          className={cn(
            "text-sm px-2 py-1 rounded",
            mode === "search"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Search
        </button>
      </header>

      <div className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {mode === "explore" ? (
            <FolderList
              folders={folders}
              filesByFolder={filesByFolder}
              openParent={openParent}
              activePath={activePath}
              onToggleParent={(path) =>
                setOpenParent((prev) => (prev === path ? null : path))
              }
              onSelectFolder={(path) => setActivePath(path)}
            />
          ) : (
            <FileSearch
              search={search}
              onSearchChange={setSearch}
              tags={tags}
              activeTag={activeTagFilter}
              onToggleTag={setActiveTagFilter}
            />
          )}
          <section className="flex-1 min-h-[220px] p-4 space-y-4 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
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
                        emptyMessage="No files in this folder yet."
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
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
