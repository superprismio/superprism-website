"use client";

import { useMemo } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { FileRow } from "@/components/heaps/types";

export type FolderNode = {
  name: string;
  path: string;
  children?: FolderNode[];
};

export type UseSpaceFilesResult = {
  folders: FolderNode[];
  filesByFolder: Record<string, FileRow[]>;
  files: FileRow[];
  tags: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: UseQueryResult<FileRow[], Error>["refetch"];
};

const SPACE_FOLDERS: FolderNode[] = [
  {
    name: "Uploads",
    path: "uploads",
    children: [
      {
        name: "Library",
        path: "uploads/library",
      },
    ],
  },
  {
    name: "Summaries",
    path: "summaries",
    children: [
      {
        name: "Meetings",
        path: "summaries/meetings",
      },
    ],
  },
];

const ALL_FOLDER_PATHS = (() => {
  const paths = new Set<string>();

  function walk(nodes: FolderNode[]) {
    for (const node of nodes) {
      paths.add(node.path);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  }

  walk(SPACE_FOLDERS);

  return Array.from(paths);
})();

function groupFilesByFolder(files: FileRow[]): Record<string, FileRow[]> {
  const byFolder = Object.fromEntries(
    ALL_FOLDER_PATHS.map((path) => [path, [] as FileRow[]])
  );

  for (const file of files) {
    const folderSegments = Array.isArray(file.meta?.folders)
      ? file.meta?.folders.filter((segment) => typeof segment === "string")
      : [];

    if (folderSegments.length === 0) {
      continue;
    }

    const folderPath = folderSegments.join("/").toLowerCase();

    if (folderPath in byFolder) {
      byFolder[folderPath].push(file);
    }
  }

  return byFolder;
}

function normalizeFiles(input: unknown): FileRow[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is FileRow => Boolean(item && item.id));
}

export function useSpaceFiles(heapId: string | null): UseSpaceFilesResult {
  const query = useQuery<FileRow[], Error>({
    queryKey: ["space-files", heapId],
    queryFn: async () => {
      if (!heapId) {
        return [];
      }

      const response = await fetch(`/api/heaps/${heapId}/files`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load files for this space");
      }

      const json = (await response.json()) as { data?: unknown };
      return normalizeFiles(json?.data);
    },
    enabled: Boolean(heapId),
    staleTime: 30_000,
  });

  const filesByFolder = useMemo(
    () => groupFilesByFolder(query.data ?? []),
    [query.data]
  );

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const file of query.data ?? []) {
      const metaTags = file.meta?.tags;
      if (Array.isArray(metaTags)) {
        for (const tag of metaTags) {
          if (typeof tag === "string" && tag.trim()) {
            seen.add(tag);
          }
        }
      }
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [query.data]);

  return {
    folders: SPACE_FOLDERS,
    filesByFolder,
    files: query.data ?? [],
    tags,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}


