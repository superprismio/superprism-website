"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { FileRow } from "@/components/heaps/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { X, ChevronRight } from "lucide-react";

type FilePreviewProps = {
  file: FileRow | null;
  onClose: () => void;
  heapId: string;
};

export function FilePreview({ file, onClose, heapId }: FilePreviewProps) {
  console.log("file", file);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isRawDialogOpen, setIsRawDialogOpen] = useState(false);
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);

  const uploadedAt =
    file?.uploaded_at && !Number.isNaN(Date.parse(file.uploaded_at))
      ? new Date(file.uploaded_at)
      : null;

  const tableOfContents = Array.isArray(file?.meta?.table_of_contents)
    ? file?.meta?.table_of_contents ?? []
    : [];

  const handleViewRaw = async () => {
    if (!file?.id) return;

    setIsLoadingRaw(true);
    setIsRawDialogOpen(true);

    try {
      const response = await fetch(`/api/heaps/${heapId}/files/${file.id}/raw`);

      if (!response.ok) {
        throw new Error("Failed to fetch raw file content");
      }

      const json = (await response.json()) as { data?: { content?: string } };
      setRawContent(json.data?.content ?? null);
    } catch (error) {
      console.error("Error fetching raw file:", error);
      setRawContent("Error loading file content");
    } finally {
      setIsLoadingRaw(false);
    }
  };

  return (
    <div className="space-y-3 text-sm text-muted-foreground ">
      <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
        <h4 className="text-sm font-medium">File Preview</h4>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          <X />
        </Button>
      </div>

      {!file ? (
        <div className="text-sm text-muted-foreground p-10">
          Select a file to preview
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">
                {file.file_name || file.id}
              </div>
              {uploadedAt ? (
                <div className="text-xs text-muted-foreground">
                  {format(uploadedAt, "MMM d, yyyy HH:mm")}
                </div>
              ) : null}
            </div>
            {file.meta?.extracted_storage_path && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleViewRaw}
              >
                View Raw
              </Button>
            )}
          </div>

          {file.meta ? (
            <div className="space-y-4 text-sm">
              {file.meta.summary_short ? (
                <div>
                  <div className="font-medium mb-1">Summary</div>
                  <div className="text-muted-foreground">
                    {file.meta.summary_short}
                  </div>
                </div>
              ) : null}

              {(() => {
                const folders = file.meta.folders;
                return Array.isArray(folders) && folders.length > 0 ? (
                  <div>
                    <div className="font-medium mb-1">Folders</div>
                    <div className="flex flex-wrap items-center gap-1">
                      {folders.map((folder, i) => (
                        <div key={folder} className="flex items-center gap-1">
                          <p className="text-md font-bold">{folder}</p>
                          {i < folders.length - 1 && (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {Array.isArray(file.meta.tags) && file.meta.tags.length > 0 ? (
                <div>
                  <div className="font-medium mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {file.meta.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {tableOfContents.length > 0 ? (
                <div>
                  <div className="font-medium mb-1">Table of Contents</div>
                  <div className="space-y-1">
                    {tableOfContents.slice(0, 5).map((toc, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground whitespace-pre-wrap"
                      >
                        {`${"  ".repeat((toc.level || 1) - 1)}${toc.title}`}
                      </div>
                    ))}
                    {tableOfContents.length > 5 ? (
                      <div className="text-xs text-muted-foreground">
                        + {tableOfContents.length - 5} more
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <Dialog open={isRawDialogOpen} onOpenChange={setIsRawDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Raw Content - {file?.file_name || file?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            {isLoadingRaw ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-4 rounded">
                {rawContent ?? "No content available"}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
