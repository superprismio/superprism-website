"use client";

import { FileRow } from "@/components/spaces/types";
import { useBatchFiles } from "@/hooks/useSpaceFiles";

type ProjectFileListProps = {
  heapId: string;
  fileIds: string[];
  onRemoveFile?: (fileId: string) => void;
  label?: string;
};

export function ProjectFileList({
  heapId,
  fileIds,
  onRemoveFile,
  label = "Files",
}: ProjectFileListProps) {
  const { data: files, isLoading, isError } = useBatchFiles(heapId, fileIds);

  if (fileIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Loading {label.toLowerCase()}...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <div className="px-2 py-1.5 text-xs text-destructive">
          Failed to load {label.toLowerCase()}
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            className="px-2 py-1.5 text-xs text-foreground border border-border rounded-md flex items-center justify-between hover:bg-muted/50"
          >
            <span className="truncate">{file.file_name || "Untitled"}</span>
            {onRemoveFile && (
              <button
                onClick={() => onRemoveFile(file.id)}
                className="text-muted-foreground hover:text-destructive text-xs ml-2 flex-shrink-0"
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

