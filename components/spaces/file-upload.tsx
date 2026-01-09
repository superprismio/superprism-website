"use client";

import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  UPLOAD_ACCEPT_ATTRIBUTE,
  isUploadAllowed,
  UPLOAD_ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from "../../lib/attachments";
import {
  X,
  Folder,
  File as FileIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { PrismLoader } from "../shared/prism-loader";
import { Progress } from "../ui/progress";

type FileUploadProps = {
  heapId: string;
  onClose: () => void;
};

type FileUploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number; // 0-100
  error?: string;
  relativePath?: string; // For folder uploads
};

type UploadMode = "files" | "folder";

export function FileUpload({ heapId, onClose }: FileUploadProps) {
  const queryClient = useQueryClient();
  const [uploadMode, setUploadMode] = useState<UploadMode>("files");
  const [fileItems, setFileItems] = useState<FileUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);

    const newItems: FileUploadItem[] = [];
    const invalidFiles: string[] = [];
    const oversizedFiles: string[] = [];

    Array.from(list).forEach((file, index) => {
      // Check file size first
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
        return;
      }

      // Always filter by allowed file types, even in folder mode
      if (isUploadAllowed(file.name)) {
        const relativePath =
          uploadMode === "folder" && "webkitRelativePath" in file
            ? (file as File & { webkitRelativePath: string }).webkitRelativePath
            : undefined;

        newItems.push({
          id: `${file.name}-${file.size}-${index}-${Date.now()}`,
          file,
          status: "pending",
          progress: 0,
          relativePath,
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    const errorMessages: string[] = [];

    if (oversizedFiles.length > 0) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      errorMessages.push(
        `${oversizedFiles.length} file(s) exceed maximum size of ${maxSizeMB}MB: ${oversizedFiles.join(", ")}`
      );
    }

    if (invalidFiles.length > 0) {
      const allowedTypes = UPLOAD_ALLOWED_EXTENSIONS.map(
        (ext) => `.${ext}`
      ).join(", ");
      const message =
        uploadMode === "folder"
          ? `${invalidFiles.length} file(s) filtered out (invalid type). Allowed types: ${allowedTypes}`
          : `Invalid file type(s): ${invalidFiles.join(
              ", "
            )}. Allowed types: ${allowedTypes}`;
      errorMessages.push(message);
    }

    if (errorMessages.length > 0) {
      setError(errorMessages.join(" "));
    }

    // Add new files to existing list
    setFileItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleModeToggle = (mode: UploadMode) => {
    if (uploading) return;
    setUploadMode(mode);
    setFileItems([]);
    setError(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Custom upload function with progress tracking
  const uploadFileWithProgress = (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!heapId) {
        reject(new Error("Heap ID is required"));
        return;
      }

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.set("file", file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const json = JSON.parse(xhr.responseText);
            reject(new Error(json.error || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("POST", `/api/heaps/${heapId}/injest/upload`);
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (!heapId || fileItems.length === 0) return;

    const pendingItems = fileItems.filter((item) => item.status === "pending");
    if (pendingItems.length === 0) return;

    setUploading(true);
    setError(null);

    // Mark all pending items as uploading
    setFileItems((prev) =>
      prev.map((item) =>
        item.status === "pending"
          ? { ...item, status: "uploading", progress: 0 }
          : item
      )
    );

    try {
      // Use batch upload for multiple files, single upload for one file
      if (pendingItems.length === 1) {
        // Single file: use progress tracking
        const item = pendingItems[0];
        try {
          await uploadFileWithProgress(item.file, (progress) => {
            setFileItems((prev) =>
              prev.map((fileItem) =>
                fileItem.id === item.id
                  ? { ...fileItem, progress }
                  : fileItem
              )
            );
          });

          setFileItems((prev) =>
            prev.map((fileItem) =>
              fileItem.id === item.id
                ? { ...fileItem, status: "success", progress: 100 }
                : fileItem
            )
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Upload failed";
          setFileItems((prev) =>
            prev.map((fileItem) =>
              fileItem.id === item.id
                ? { ...fileItem, status: "error", error: errorMessage, progress: 0 }
                : fileItem
            )
          );
        }
      } else {
        // Multiple files: use batch upload endpoint
        const formData = new FormData();
        pendingItems.forEach((item) => {
          formData.append("files", item.file);
        });

        // Show progress as indeterminate (50%) while batch upload is processing
        pendingItems.forEach((item) => {
          setFileItems((prev) =>
            prev.map((fileItem) =>
              fileItem.id === item.id
                ? { ...fileItem, progress: 50 }
                : fileItem
            )
          );
        });

        const response = await fetch(
          `/api/heaps/${heapId}/injest/upload/batch`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const json = await response.json().catch(() => ({
            error: "Batch upload failed",
          }));
          throw new Error(json.error || "Batch upload failed");
        }

        const result = await response.json();
        const results = result.results as Array<{
          fileName: string;
          success: boolean;
          error?: string;
        }>;

        // Update file items based on batch results
        results.forEach((fileResult) => {
          const item = pendingItems.find(
            (item) => item.file.name === fileResult.fileName
          );
          if (item) {
            setFileItems((prev) =>
              prev.map((fileItem) =>
                fileItem.id === item.id
                  ? {
                      ...fileItem,
                      status: fileResult.success
                        ? "success"
                        : "error",
                      progress: fileResult.success ? 100 : 0,
                      error: fileResult.error,
                    }
                  : fileItem
              )
            );
          }
        });
      }

      // Invalidate query cache to refresh file list
      void queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      // Mark all uploading items as error
      setFileItems((prev) =>
        prev.map((item) =>
          item.status === "uploading"
            ? { ...item, status: "error", error: errorMessage, progress: 0 }
            : item
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: FileUploadItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "uploading":
        return (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        );
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const pendingCount = fileItems.filter((item) => item.status === "pending")
    .length;
  const uploadingCount = fileItems.filter(
    (item) => item.status === "uploading"
  ).length;
  const successCount = fileItems.filter((item) => item.status === "success")
    .length;
  const errorCount = fileItems.filter((item) => item.status === "error").length;
  const hasPendingOrUploading = pendingCount > 0 || uploadingCount > 0;

  const overallError =
    error ||
    (errorCount > 0
      ? `${errorCount} file(s) failed to upload. Check individual files for details.`
      : null);

  const overallSuccess =
    successCount > 0 &&
    !hasPendingOrUploading &&
    errorCount === 0
      ? `Successfully uploaded ${successCount} file(s).`
      : null;

  return (
    <div className="holographic-shimmer h-full relative">
      {uploading && uploadingCount > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <PrismLoader size={200} className="text-primary" />
            <p className="text-sm text-muted-foreground">
              Uploading {uploadingCount} file(s)...
            </p>
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
              Choose files or a folder to ingest into this heap.
            </p>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>

        {/* Upload Mode Toggle */}
        <div className="flex gap-2 rounded-md border p-1">
          <Button
            type="button"
            variant={uploadMode === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeToggle("files")}
            disabled={uploading}
            className="flex-1 gap-2"
          >
            <FileIcon className="h-4 w-4" />
            Files
          </Button>
          <Button
            type="button"
            variant={uploadMode === "folder" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeToggle("folder")}
            disabled={uploading}
            className="flex-1 gap-2"
          >
            <Folder className="h-4 w-4" />
            Folder
          </Button>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          multiple={uploadMode === "files"}
          {...(uploadMode === "folder"
            ? { webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>
            : {})}
          accept={uploadMode === "files" ? UPLOAD_ACCEPT_ATTRIBUTE : undefined}
          onChange={(event) => handleFileSelection(event.target.files)}
          disabled={uploading}
        />

        {uploadMode === "folder" && (
          <p className="text-xs text-muted-foreground">
            Files in the selected folder will be uploaded. Only allowed file types ({UPLOAD_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(", ")}) up to {MAX_FILE_SIZE / (1024 * 1024)}MB will be included.
          </p>
        )}

        {fileItems.length > 0 && (
          <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-md border">
            <div className="flex items-center justify-between border-b p-3">
              <div className="text-sm font-medium text-foreground">
                Selected files ({fileItems.length})
              </div>
              {fileItems.length > 0 && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {pendingCount > 0 && <span>{pendingCount} pending</span>}
                  {uploadingCount > 0 && (
                    <span className="text-primary">{uploadingCount} uploading</span>
                  )}
                  {successCount > 0 && (
                    <span className="text-green-600">{successCount} done</span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-destructive">{errorCount} failed</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {fileItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-md border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">
                        {item.file.name}
                      </div>
                      {item.relativePath && (
                        <div className="truncate text-xs text-muted-foreground">
                          {item.relativePath}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(item.file.size)}</span>
                        {item.status === "uploading" && (
                          <span className="text-primary">{item.progress}%</span>
                        )}
                      </div>
                      {item.error && (
                        <div className="text-xs text-destructive">
                          {item.error}
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFile(item.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {item.status === "uploading" && (
                    <Progress value={item.progress} className="h-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {overallError && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
            {overallError}
          </div>
        )}

        {overallSuccess && (
          <div className="rounded border border-green-500/50 bg-green-500/10 p-2 text-sm text-green-600">
            {overallSuccess}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading || pendingCount === 0}
            className="flex-1"
          >
            {uploading
              ? `Uploading (${uploadingCount}/${pendingCount + uploadingCount})`
              : `Upload ${pendingCount > 0 ? `${pendingCount} file(s)` : ""}`}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFileItems([]);
              setError(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={uploading || fileItems.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
