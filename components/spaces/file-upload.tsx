"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type FileUploadProps = {
  heapId: string;
};

export function FileUpload({ heapId }: FileUploadProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelection = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setFiles(Array.from(list));
    setError(null);
    setSuccess(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!heapId || files.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.set("file", file);
          const response = await fetch(
            `/api/heaps/${heapId}/injest/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            const json = await response
              .json()
              .catch(() => ({ error: "Upload failed" }));
            throw new Error(json.error || "Upload failed");
          }
        })
      );
      await queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
      setSuccess(true);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h4 className="text-lg font-semibold text-foreground">File Upload</h4>
        <p className="text-sm text-muted-foreground">
          Choose files to ingest into this heap.
        </p>
      </div>

      <Input
        type="file"
        multiple
        onChange={(event) => handleFileSelection(event.target.files)}
        disabled={uploading}
      />

      {files.length > 0 && (
        <div className="space-y-2 rounded-md border p-3">
          <div className="text-sm font-medium text-foreground">
            Selected files
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="h-6 px-2 text-xs"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded border border-green-500/50 bg-green-500/10 p-2 text-sm text-green-600">
          Upload complete.
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="flex-1"
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFiles([]);
            setError(null);
            setSuccess(false);
          }}
          disabled={uploading || files.length === 0}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

