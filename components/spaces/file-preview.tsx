"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { X, ChevronRight, Eye, EyeOff } from "lucide-react";
import { FileRow } from "./types";
import { createClient } from "@/lib/supabase/client";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { isOwnerOrFileCreator } from "@/lib/auth-helpers";
import { useSpaceMembers } from "@/hooks/useMembers";
import { generateShareUrl } from "@/lib/share-link";
import { ShareButton } from "./share-button";
import { useUserDisplayName } from "@/hooks/useProfile";

type FilePreviewProps = {
  file: FileRow | null;
  onClose: () => void;
  heapId: string;
  onEditFile?: (file: FileRow, content: string) => void;
  onToggleVisibility?: (
    fileId: string,
    visibility: "public" | "private"
  ) => Promise<void>;
  onDeleteFile?: (fileId: string) => Promise<void>;
  useDialog?: boolean;
};

export function FilePreview({
  file,
  onClose,
  heapId,
  onEditFile,
  onToggleVisibility,
  onDeleteFile,
  useDialog = false,
}: FilePreviewProps) {
  const { fetchRawFileContent, updateFileName } = useSpaceFiles(heapId);
  const { data: members = [] } = useSpaceMembers(heapId);
  const uploaderDisplayName = useUserDisplayName(
    file?.uploader_id ?? null,
    heapId
  );
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isRawDialogOpen, setIsRawDialogOpen] = useState(false);
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    void getCurrentUser();
  }, []);

  // Check if current user is heap owner/admin
  const isHeapOwner = useMemo(() => {
    if (!currentUserId) return false;
    const currentUserMembership = members.find(
      (m) => m.user_id === currentUserId
    );
    return (
      currentUserMembership?.role === "admin" ||
      currentUserMembership?.role === "owner"
    );
  }, [members, currentUserId]);

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
      const content = await fetchRawFileContent(file.id);
      setRawContent(content);
    } catch (error) {
      console.error("Error fetching raw file:", error);
      setRawContent("Error loading file content");
    } finally {
      setIsLoadingRaw(false);
    }
  };

  const stripFrontMatter = (markdown: string): string => {
    // Check if content starts with front matter delimiter
    if (!markdown.trim().startsWith("---")) {
      return markdown;
    }

    // Find the first line break after the opening ---
    const firstLineBreak = markdown.indexOf("\n");
    if (firstLineBreak === -1) {
      return markdown;
    }

    // Find the closing --- delimiter (must be on its own line: \n---\n or \n--- at end)
    const closingMatch = markdown.match(/\n---(\n|$)/);
    if (!closingMatch || closingMatch.index === undefined) {
      return markdown;
    }

    // Extract content after the closing delimiter
    const contentStart = closingMatch.index + closingMatch[0].length;
    return markdown.slice(contentStart);
  };

  const handleEditRaw = async () => {
    if (!file?.id || !onEditFile) return;

    setIsLoadingRaw(true);

    try {
      const rawContent = await fetchRawFileContent(file.id);
      const content = stripFrontMatter(rawContent);

      onEditFile(file, content);
    } catch (error) {
      console.error("Error fetching raw file for editing:", error);
    } finally {
      setIsLoadingRaw(false);
    }
  };

  const canEdit =
    file &&
    currentUserId &&
    isOwnerOrFileCreator(currentUserId, file.uploader_id, isHeapOwner) &&
    file.meta?.extracted_file_hash !== undefined;
  const canToggleVisibility =
    file &&
    isOwnerOrFileCreator(currentUserId, file.uploader_id, isHeapOwner) &&
    onToggleVisibility;
  const canDelete =
    file &&
    isOwnerOrFileCreator(currentUserId, file.uploader_id, isHeapOwner) &&
    onDeleteFile;
  const canRename =
    file && isOwnerOrFileCreator(currentUserId, file.uploader_id, isHeapOwner);

  const handleToggleVisibility = async () => {
    if (!file || !onToggleVisibility) return;
    const newVisibility = file.visibility === "public" ? "private" : "public";
    setIsTogglingVisibility(true);
    try {
      await onToggleVisibility(file.id, newVisibility);
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!file || !onDeleteFile) return;
    setIsDeleting(true);
    try {
      await onDeleteFile(file.id);
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameClick = () => {
    if (!file) return;
    setRenameValue(file.file_name || "");
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!file || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await updateFileName(file.id, renameValue.trim());
      setIsRenameDialogOpen(false);
      setRenameValue("");
    } catch (error) {
      console.error("Failed to rename file:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const previewHeader = (
    <div className="flex items-center justify-between border-b border-b-border px-3 py-4">
      <h4 className="text-sm font-medium">File Preview</h4>
      <div className="flex items-center gap-2">
        {file && (
          <ShareButton
            url={generateShareUrl(heapId, {
              section: "knowledge",
              fileId: file.id,
            })}
            size="sm"
          />
        )}
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          <X />
        </Button>
      </div>
    </div>
  );

  const previewBody = !file ? (
    <div className="text-sm text-muted-foreground p-10">
      Select a file to preview
    </div>
  ) : (
    <div className="space-y-4 overflow-y-auto px-4 py-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">{file.file_name || file.id}</div>
          {uploadedAt ? (
            <div className="text-xs text-muted-foreground">
              {format(uploadedAt, "MMM d, yyyy HH:mm")}
            </div>
          ) : null}
        </div>
        {file.meta?.extracted_storage_path && !useDialog && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleViewRaw}
            >
              View Raw
            </Button>
            {canEdit && onEditFile && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleEditRaw}
                disabled={isLoadingRaw}
              >
                Edit Raw
              </Button>
            )}
            {canRename && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRenameClick}
              >
                Rename
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDeleteClick}
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 text-sm">
        {file.visibility !== undefined && file.visibility !== null ? (
          <div>
            <div className="font-medium mb-1">Visibility</div>
            <div className="flex items-center gap-2">
              {file.visibility === "public" ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground capitalize">
                {file.visibility}
              </span>
              {canToggleVisibility && !useDialog && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleToggleVisibility}
                  disabled={isTogglingVisibility}
                  className="ml-auto"
                  title={
                    file.visibility === "public"
                      ? "Make private"
                      : "Make public"
                  }
                >
                  {isTogglingVisibility
                    ? "Updating..."
                    : file.visibility === "public"
                    ? "Make Private"
                    : "Make Public"}
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {file.uploader_id ? (
          <div>
            <div className="font-medium mb-1">Uploaded by</div>
            <div className="text-muted-foreground text-xs">
              {uploaderDisplayName}
            </div>
          </div>
        ) : null}

        {file.meta ? (
          <div className="space-y-4">
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
    </div>
  );

  if (useDialog) {
    return (
      <>
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {file?.file_name || file?.id || "File Preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh] space-y-3 text-sm text-muted-foreground">
              {previewBody}
            </div>
          </DialogContent>
        </Dialog>

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

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;
                {file?.file_name || file?.id}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
              <DialogDescription>
                Enter a new name for the file.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="File name"
                disabled={isRenaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && renameValue.trim()) {
                    void handleConfirmRename();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setRenameValue("");
                }}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmRename}
                disabled={isRenaming || !renameValue.trim()}
              >
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="holographic-shimmer h-full" id={`file-preview-${file?.id}`}>
      <div className="space-y-3 text-sm text-muted-foreground ">
        {previewHeader}
        {previewBody}
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

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;
                {file?.file_name || file?.id}&quot;? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
              <DialogDescription>
                Enter a new name for the file.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="File name"
                disabled={isRenaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && renameValue.trim()) {
                    void handleConfirmRename();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setRenameValue("");
                }}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmRename}
                disabled={isRenaming || !renameValue.trim()}
              >
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
