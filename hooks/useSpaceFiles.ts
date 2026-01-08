"use client";

import { useMemo } from "react";
import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileRow } from "@/components/spaces/types";

export type FolderNode = {
  name: string;
  path: string;
  children?: FolderNode[];
};

export type SaveMarkdownParams = {
  markdown: string;
  fileName?: string;
  fileId?: string;
  fileOp?: "create" | "update";
  fileFolders?: string[];
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
  updateFileFolders: (fileId: string, folders: string[]) => Promise<void>;
  updateFileVisibility: (fileId: string, visibility: "public" | "private") => Promise<void>;
  fetchRawFileContent: (fileId: string) => Promise<string>;
  uploadFile: (file: File) => Promise<void>;
  saveMarkdown: (params: SaveMarkdownParams) => Promise<void>;
  scrapeWeb: (url: string) => Promise<string>;
  isScrapingWeb: boolean;
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

export function useBatchFiles(heapId: string | null, fileIds: string[]) {
  return useQuery<FileRow[], Error>({
    queryKey: ["project-files", heapId, fileIds],
    queryFn: async () => {
      if (!heapId || fileIds.length === 0) {
        return [];
      }

      const idsParam = fileIds.join(",");
      const response = await fetch(
        `/api/heaps/${heapId}/files/batch?ids=${encodeURIComponent(idsParam)}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load files");
      }

      const json = (await response.json()) as { data?: unknown };
      return normalizeFiles(json?.data);
    },
    enabled: Boolean(heapId) && fileIds.length > 0,
    staleTime: 30_000,
  });
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

  const updateFoldersMutation = useMutation({
    mutationFn: async ({ fileId, folders }: { fileId: string; folders: string[] }) => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

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
    },
    onSuccess: () => {
      // Invalidate and refetch files after successful update
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ fileId, visibility }: { fileId: string; visibility: "public" | "private" }) => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const response = await fetch(`/api/heaps/${heapId}/files/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to update file visibility");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch files after successful update
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch(`/api/heaps/${heapId}/injest/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(json.error || "Upload failed");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch files after successful upload
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    },
  });

  const saveMarkdownMutation = useMutation({
    mutationFn: async (params: SaveMarkdownParams) => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const response = await fetch(`/api/heaps/${heapId}/injest/markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: params.markdown,
          file_name: params.fileName?.trim() || undefined,
          file_id: params.fileId || undefined,
          file_op: params.fileOp || "create",
          file_folders: params.fileFolders || undefined,
        }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({ error: "Failed to save markdown" }));
        throw new Error(json.error || "Failed to save markdown");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch files after successful save
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    },
  });

  const scrapeWebMutation = useMutation({
    mutationFn: async (url: string): Promise<string> => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const response = await fetch(`/api/heaps/${heapId}/injest/web`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({ error: "Failed to scrape URL" }));
        throw new Error(json.error || "Failed to scrape URL");
      }

      const data = await response.json();
      if (!data.markdown) {
        throw new Error("No content returned from URL");
      }

      return data.markdown;
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

  const fetchRawFileContent = async (fileId: string): Promise<string> => {
    if (!heapId) {
      throw new Error("Heap ID is required");
    }

    const response = await fetch(`/api/heaps/${heapId}/files/${fileId}/raw`);

    if (!response.ok) {
      throw new Error("Failed to fetch raw file content");
    }

    const json = (await response.json()) as { data?: { content?: string } };
    return json.data?.content ?? "";
  };

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
    updateFileFolders: async (fileId: string, folders: string[]) => {
      await updateFoldersMutation.mutateAsync({ fileId, folders });
    },
    updateFileVisibility: async (fileId: string, visibility: "public" | "private") => {
      await updateVisibilityMutation.mutateAsync({ fileId, visibility });
    },
    fetchRawFileContent,
    uploadFile: async (file: File) => {
      await uploadMutation.mutateAsync(file);
    },
    saveMarkdown: async (params: SaveMarkdownParams) => {
      await saveMarkdownMutation.mutateAsync(params);
    },
    scrapeWeb: async (url: string) => {
      return await scrapeWebMutation.mutateAsync(url);
    },
    isScrapingWeb: scrapeWebMutation.isPending,
  };
}
