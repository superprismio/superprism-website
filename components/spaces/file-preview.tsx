"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { FileRow } from "@/components/heaps/types";
import { Button } from "@/components/ui/button";

type FilePreviewProps = {
  file: FileRow | null;
  onClose: () => void;
};

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const uploadedAt =
    file?.uploaded_at && !Number.isNaN(Date.parse(file.uploaded_at))
      ? new Date(file.uploaded_at)
      : null;

  const tableOfContents = Array.isArray(file?.meta?.table_of_contents)
    ? file?.meta?.table_of_contents ?? []
    : [];

  return (
    <div className="flex h-full flex-col gap-4 py-3 px-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">File Preview</h4>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Back to knowledge graph
        </Button>
      </div>

      {!file ? (
        <div className="text-sm text-muted-foreground">
          Select a file to preview
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-1">
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

              {Array.isArray(file.meta.folders) &&
              file.meta.folders.length > 0 ? (
                <div>
                  <div className="font-medium mb-1">Folders</div>
                  <div className="flex flex-wrap gap-1">
                    {file.meta.folders.map((folder) => (
                      <Badge key={folder} variant="outline" className="text-xs">
                        {folder}
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
    </div>
  );
}
