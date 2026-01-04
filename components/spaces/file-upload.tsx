"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  UPLOAD_ACCEPT_ATTRIBUTE,
  isUploadAllowed,
  UPLOAD_ALLOWED_EXTENSIONS,
} from "../../lib/attachments";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { X } from "lucide-react";
import { PrismLoader } from "../shared/prism-loader";

type FileUploadProps = {
  heapId: string;
  onClose: () => void;
};

export function FileUpload({ heapId, onClose }: FileUploadProps) {
  const { uploadFile } = useSpaceFiles(heapId);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelection = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);
    setSuccess(false);

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(list).forEach((file) => {
      if (isUploadAllowed(file.name)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      const allowedTypes = UPLOAD_ALLOWED_EXTENSIONS.map(
        (ext) => `.${ext}`
      ).join(", ");
      setError(
        `Invalid file type(s): ${invalidFiles.join(
          ", "
        )}. Allowed types: ${allowedTypes}`
      );
    }

    setFiles(validFiles);
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
      await Promise.all(files.map((file) => uploadFile(file)));
      setSuccess(true);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="holographic-shimmer h-full relative">
      {uploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <PrismLoader size={200} className="text-primary" />
          </div>
        </div>
      )}
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              File Upload
            </h4>
            <p className="text-sm text-muted-foreground">
              Choose files to ingest into this heap.
            </p>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>

        <Input
          type="file"
          multiple
          accept={UPLOAD_ACCEPT_ATTRIBUTE}
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

        <div className="mt-5 flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex-1"
          >
            Upload
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
    </div>
  );
}
