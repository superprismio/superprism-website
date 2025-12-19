"use client";

import { useQuery } from "@tanstack/react-query";
import { FileRow } from "@/components/spaces/types";

type ProjectFileListProps = {
  heapId: string;
  fileIds: string[];
  onRemoveFile?: (fileId: string) => void;
  label?: string;
};

function normalizeFiles(input: unknown): FileRow[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is FileRow => Boolean(item && item.id));
}

export function ProjectFileList({
  heapId,
  fileIds,
  onRemoveFile,
  label = "Files",
}: ProjectFileListProps) {
  const { data: files, isLoading, isError } = useQuery<FileRow[], Error>({
    queryKey: ["project-files", heapId, fileIds],
    queryFn: async () => {
      if (fileIds.length === 0) {
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
    enabled: fileIds.length > 0,
    staleTime: 30_000,
  });

  if (fileIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Loading {label.toLowerCase()}...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="px-3 py-2 text-sm text-destructive">
          Failed to load {label.toLowerCase()}
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            className="px-3 py-2 text-sm text-foreground border border-border rounded-md flex items-center justify-between hover:bg-muted/50"
          >
            <span>{file.file_name || "Untitled"}</span>
            {onRemoveFile && (
              <button
                onClick={() => onRemoveFile(file.id)}
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

