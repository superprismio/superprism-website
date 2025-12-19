"use client";

import { useMemo } from "react";
import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileRow } from "@/components/spaces/types";

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
  deleteFile: (fileId: string) => Promise<void>;
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
      {
        name: "Summaries",
        path: "public/summaries",
        children: [
          {
            name: "Meetings",
            path: "public/summaries/meetings",
          },
        ],
      },
      {
        name: "Documents",
        path: "public/documents",
      },
      {
        name: "Notes",
        path: "public/notes",
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

    const isPublic = file.visibility === "public";
    const basePath = isPublic ? "public" : "local";

    let folderPath: string | null = null;

    if (folderSegments.length === 0) {
      // No folders specified, put in Staging
      folderPath = "staging";
    } else {
      // Map folder segments to full path (prepend "public" or "local" based on visibility)
      const normalizedSegments = folderSegments.map((s) =>
        s.toLowerCase().trim()
      );
      
      // Check if it matches prescribed paths
      if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "artifacts"
      ) {
        folderPath = `${basePath}/artifacts`;
      } else if (
        normalizedSegments.length === 2 &&
        normalizedSegments[0] === "summaries" &&
        normalizedSegments[1] === "meetings"
      ) {
        folderPath = `${basePath}/summaries/meetings`;
      } else if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "documents"
      ) {
        folderPath = `${basePath}/documents`;
      } else if (
        normalizedSegments.length === 1 &&
        normalizedSegments[0] === "notes"
      ) {
        folderPath = `${basePath}/notes`;
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
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const response = await fetch(`/api/heaps/${heapId}/injest/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: fileId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to delete file");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch files after successful deletion
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    },
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
    deleteFile: async (fileId: string) => {
      await deleteMutation.mutateAsync(fileId);
    },
  };
}
