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
    name: "Staging",
    path: "staging",
  },
  {
    name: "Local",
    path: "local",
    children: [
      {
        name: "Artifacts",
        path: "local/artifacts",
      },
      {
        name: "Summaries",
        path: "local/summaries",
        children: [
          {
            name: "Meetings",
            path: "local/summaries/meetings",
          },
        ],
      },
      {
        name: "Documents",
        path: "local/documents",
      },
      {
        name: "Notes",
        path: "local/notes",
      },
    ],
  },
  {
    name: "Public",
    path: "public",
    children: [
      {
        name: "Artifacts",
        path: "public/artifacts",
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

  // Also initialize staging folder
  byFolder["staging"] = [];

  for (const file of files) {
    const folderSegments = Array.isArray(file.meta?.folders)
      ? file.meta?.folders.filter((segment) => typeof segment === "string")
      : [];

    let folderPath: string | null = null;

    if (folderSegments.length === 0) {
      // No folders specified, put in Staging
      folderPath = "staging";
    } else {
      // Map folder segments to full path (prepending "local" for now since no Public flag yet)
      const normalizedSegments = folderSegments.map((s) =>
        s.toLowerCase().trim()
      );
      // Check if it matches prescribed Local paths
      if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "artifacts"
      ) {
        folderPath = "local/artifacts";
      } else if (
        normalizedSegments.length === 2 &&
        normalizedSegments[0] === "summaries" &&
        normalizedSegments[1] === "meetings"
      ) {
        folderPath = "local/summaries/meetings";
      } else if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "documents"
      ) {
        folderPath = "local/documents";
      } else if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "notes"
      ) {
        folderPath = "local/notes";
      } else {
        // Doesn't match prescribed paths, put in Staging
        folderPath = "staging";
      }
    }

    if (folderPath && folderPath in byFolder) {
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
