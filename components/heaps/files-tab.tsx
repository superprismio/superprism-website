"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { FileRow, Tag } from "./types";

export function FilesTab({
  heapId,
  onAttachFileToChat,
  md,
  onMdChange,
}: {
  heapId: string;
  onAttachFileToChat?: (fileId: string) => void;
  md?: string;
  onMdChange?: (md: string) => void;
}) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [localMd, setLocalMd] = useState<string>(md || "");
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>(
    []
  );
  const [selectedTagsForUpload, setSelectedTagsForUpload] = useState<string[]>(
    []
  );
  const [newTagLabel, setNewTagLabel] = useState("");
  const [creatingTags, setCreatingTags] = useState(false);
  const [tagCreateError, setTagCreateError] = useState<string | null>(null);
  const [ingestingMarkdown, setIngestingMarkdown] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [markdownFileName, setMarkdownFileName] = useState("");
  const [selectedTagsForMarkdown, setSelectedTagsForMarkdown] = useState<
    string[]
  >([]);
  const [newTagLabelForMarkdown, setNewTagLabelForMarkdown] = useState("");
  const [creatingTagForMarkdown, setCreatingTagForMarkdown] = useState(false);
  const [tagCreateErrorForMarkdown, setTagCreateErrorForMarkdown] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (md !== undefined) {
      setLocalMd(md);
    }
  }, [md]);

  useEffect(() => {
    if (!heapId) {
      setFiles([]);
      setTags([]);
      return;
    }
    let mounted = true;
    (async () => {
      setFileLoading(true);
      setTagLoading(true);
      try {
        const [filesRes, tagsRes] = await Promise.all([
          fetch(`/api/heaps/${heapId}/files`),
          fetch(`/api/heaps/${heapId}/tags`),
        ]);
        const [filesJson, tagsJson] = await Promise.all([
          filesRes.json(),
          tagsRes.json(),
        ]);
        if (!mounted) return;
        if (filesRes.ok) setFiles(filesJson.data || []);
        if (tagsRes.ok)
          setTags(
            (tagsJson.data || []).map((t: any) => ({
              slug: t.slug,
              label: t.label,
            }))
          );
      } finally {
        if (mounted) {
          setFileLoading(false);
          setTagLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId]);

  const filteredFiles = useMemo(() => {
    let list = files;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => (f.file_name || "").toLowerCase().includes(q));
    }
    if (activeTagFilter) {
      list = list.filter((f) => {
        const tagsFromMeta = f.meta?.tags;
        return Array.isArray(tagsFromMeta)
          ? tagsFromMeta.includes(activeTagFilter)
          : false;
      });
    }
    return list;
  }, [files, search, activeTagFilter]);

  function handleFileSelection(inputFiles: FileList | null) {
    if (!inputFiles || inputFiles.length === 0) return;
    setSelectedFilesForUpload(Array.from(inputFiles));
    setUploadError(null);
  }

  async function handleUploadFiles() {
    if (!heapId || selectedFilesForUpload.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Step 1: Create any new tags first if user entered them
      const tagsToUse = [...selectedTagsForUpload];
      if (newTagLabel.trim()) {
        const label = newTagLabel.trim();
        const slug = generateSlug(label);

        // Check if it doesn't already exist
        if (
          !tags.some(
            (t) =>
              t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
          )
        ) {
          const createTagRes = await fetch(`/api/heaps/${heapId}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, slug, is_active: true }),
          });

          if (!createTagRes.ok) {
            const error = await createTagRes
              .json()
              .catch(() => ({ error: "Failed to create tag" }));
            throw new Error(error.error || "Failed to create tag");
          }

          const createTagJson = await createTagRes.json();
          const newTag = {
            slug: createTagJson.data.slug,
            label: createTagJson.data.label,
          };
          setTags((prev) => [...prev, newTag]);
          tagsToUse.push(newTag.slug);
        } else {
          // Tag exists, find its slug
          const existingTag = tags.find(
            (t) =>
              t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
          );
          if (existingTag && !tagsToUse.includes(existingTag.slug)) {
            tagsToUse.push(existingTag.slug);
          }
        }
      }

      // Step 2: Proceed with file upload
      const uploadPromises = selectedFilesForUpload.map(async (file) => {
        const formData = new FormData();
        formData.set("file", file);

        if (tagsToUse.length > 0) {
          formData.set("file_tags", JSON.stringify(tagsToUse));
        }

        const response = await fetch(`/api/heaps/${heapId}/injest/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: "Upload failed" }));
          throw new Error(error.error || "Upload failed");
        }

        return response.json();
      });

      await Promise.all(uploadPromises);

      // Refresh files list after successful uploads
      const filesRes = await fetch(`/api/heaps/${heapId}/files`);
      if (filesRes.ok) {
        const filesJson = await filesRes.json();
        setFiles(filesJson.data || []);
      }

      // Refresh tags list to include newly created tags
      const tagsRes = await fetch(`/api/heaps/${heapId}/tags`);
      if (tagsRes.ok) {
        const tagsJson = await tagsRes.json();
        setTags(
          (tagsJson.data || []).map((t: any) => ({
            slug: t.slug,
            label: t.label,
          }))
        );
      }

      // Reset selection after successful upload
      setSelectedFilesForUpload([]);
      setSelectedTagsForUpload([]);
      setNewTagLabel("");
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveFile(index: number) {
    setSelectedFilesForUpload((prev) => prev.filter((_, i) => i !== index));
  }

  function generateSlug(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleCreateAndAddTag() {
    if (!heapId || !newTagLabel.trim()) return;

    const label = newTagLabel.trim();
    const slug = generateSlug(label);

    // Check if tag already exists
    if (
      tags.some(
        (t) => t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
      )
    ) {
      setTagCreateError("Tag already exists");
      return;
    }

    setCreatingTags(true);
    setTagCreateError(null);
    try {
      const res = await fetch(`/api/heaps/${heapId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, slug, is_active: true }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to create tag" }));
        throw new Error(error.error || "Failed to create tag");
      }

      const json = await res.json();
      const newTag = { slug: json.data.slug, label: json.data.label };
      setTags((prev) => [...prev, newTag]);
      setSelectedTagsForUpload((prev) => [...prev, newTag.slug]);
      setNewTagLabel("");
      setTagCreateError(null);
    } catch (error) {
      setTagCreateError(
        error instanceof Error ? error.message : "Failed to create tag"
      );
    } finally {
      setCreatingTags(false);
    }
  }

  function handleToggleTagForUpload(tagSlug: string) {
    setSelectedTagsForUpload((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((slug) => slug !== tagSlug)
        : [...prev, tagSlug]
    );
  }

  function handleOpenIngestDialog() {
    const currentMd = md !== undefined ? md : localMd;
    if (!currentMd.trim()) return;
    // Set default filename based on first line or timestamp
    const firstLine = currentMd
      .split("\n")[0]
      .replace(/^#+\s*/, "")
      .trim();
    const defaultName = firstLine
      ? `${generateSlug(firstLine)}.md`
      : `markdown-${Date.now()}.md`;
    setMarkdownFileName(defaultName);
    setSelectedTagsForMarkdown([]);
    setNewTagLabelForMarkdown("");
    setTagCreateErrorForMarkdown(null);
    setShowIngestDialog(true);
  }

  async function handleCreateAndAddTagForMarkdown() {
    if (!heapId || !newTagLabelForMarkdown.trim()) return;

    const label = newTagLabelForMarkdown.trim();
    const slug = generateSlug(label);

    // Check if tag already exists
    if (
      tags.some(
        (t) => t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
      )
    ) {
      setTagCreateErrorForMarkdown("Tag already exists");
      return;
    }

    setCreatingTagForMarkdown(true);
    setTagCreateErrorForMarkdown(null);
    try {
      const res = await fetch(`/api/heaps/${heapId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, slug, is_active: true }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to create tag" }));
        throw new Error(error.error || "Failed to create tag");
      }

      const json = await res.json();
      const newTag = { slug: json.data.slug, label: json.data.label };
      setTags((prev) => [...prev, newTag]);
      setSelectedTagsForMarkdown((prev) => [...prev, newTag.slug]);
      setNewTagLabelForMarkdown("");
      setTagCreateErrorForMarkdown(null);
    } catch (error) {
      setTagCreateErrorForMarkdown(
        error instanceof Error ? error.message : "Failed to create tag"
      );
    } finally {
      setCreatingTagForMarkdown(false);
    }
  }

  function handleToggleTagForMarkdown(tagSlug: string) {
    setSelectedTagsForMarkdown((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((slug) => slug !== tagSlug)
        : [...prev, tagSlug]
    );
  }

  async function handleIngestMarkdown() {
    const currentMd = md !== undefined ? md : localMd;
    if (!heapId || !currentMd.trim()) return;

    // Validate filename
    const fileName = markdownFileName.trim() || `markdown-${Date.now()}.md`;
    const finalFileName = fileName.endsWith(".md")
      ? fileName
      : `${fileName}.md`;

    setIngestingMarkdown(true);
    setIngestError(null);

    try {
      // Step 1: Create any new tags first if user entered them
      const tagsToUse = [...selectedTagsForMarkdown];
      if (newTagLabelForMarkdown.trim()) {
        const label = newTagLabelForMarkdown.trim();
        const slug = generateSlug(label);

        // Check if it doesn't already exist
        if (
          !tags.some(
            (t) =>
              t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
          )
        ) {
          const createTagRes = await fetch(`/api/heaps/${heapId}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, slug, is_active: true }),
          });

          if (!createTagRes.ok) {
            const error = await createTagRes
              .json()
              .catch(() => ({ error: "Failed to create tag" }));
            throw new Error(error.error || "Failed to create tag");
          }

          const createTagJson = await createTagRes.json();
          const newTag = {
            slug: createTagJson.data.slug,
            label: createTagJson.data.label,
          };
          setTags((prev) => [...prev, newTag]);
          tagsToUse.push(newTag.slug);
        } else {
          // Tag exists, find its slug
          const existingTag = tags.find(
            (t) =>
              t.slug === slug || t.label.toLowerCase() === label.toLowerCase()
          );
          if (existingTag && !tagsToUse.includes(existingTag.slug)) {
            tagsToUse.push(existingTag.slug);
          }
        }
      }

      // Step 2: Ingest the markdown
      const response = await fetch(`/api/heaps/${heapId}/injest/markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentMd,
          file_name: finalFileName,
          file_tags: tagsToUse,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to ingest markdown" }));
        throw new Error(error.error || "Failed to ingest markdown");
      }

      // Refresh files list after successful ingestion
      const filesRes = await fetch(`/api/heaps/${heapId}/files`);
      if (filesRes.ok) {
        const filesJson = await filesRes.json();
        setFiles(filesJson.data || []);
      }

      // Refresh tags list to include newly created tags
      const tagsRes = await fetch(`/api/heaps/${heapId}/tags`);
      if (tagsRes.ok) {
        const tagsJson = await tagsRes.json();
        setTags(
          (tagsJson.data || []).map((t: any) => ({
            slug: t.slug,
            label: t.label,
          }))
        );
      }

      // Close dialog and clear markdown after successful save
      setShowIngestDialog(false);
      setLocalMd("");
      onMdChange?.("");
      setMarkdownFileName("");
      setSelectedTagsForMarkdown([]);
      setNewTagLabelForMarkdown("");
    } catch (error) {
      console.error("Markdown ingestion error:", error);
      setIngestError(
        error instanceof Error ? error.message : "Failed to ingest markdown"
      );
    } finally {
      setIngestingMarkdown(false);
    }
  }

  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              multiple
              onChange={(e) => handleFileSelection(e.target.files)}
              disabled={uploading}
            />
            <div className="text-xs text-muted-foreground">
              Step 1: Select files to upload
            </div>
          </div>

          {selectedFilesForUpload.length > 0 && (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium">Selected files:</div>
                <div className="space-y-1">
                  {selectedFilesForUpload.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-accent rounded text-sm"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFile(index)}
                        disabled={uploading}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Step 2: Add tags (optional):
                </div>
                {tagLoading ? (
                  <div className="text-xs text-muted-foreground">
                    Loading tags...
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => handleToggleTagForUpload(t.slug)}
                          disabled={uploading}
                        >
                          <Badge
                            variant={
                              selectedTagsForUpload.includes(t.slug)
                                ? "default"
                                : "secondary"
                            }
                          >
                            {t.label}
                          </Badge>
                        </button>
                      ))}
                      {tags.length === 0 && (
                        <div className="text-xs text-muted-foreground">
                          No tags available
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium">Create new tag:</div>
                      <div className="flex gap-2">
                        <Input
                          value={newTagLabel}
                          onChange={(e) => {
                            setNewTagLabel(e.target.value);
                            setTagCreateError(null);
                          }}
                          placeholder="Enter new tag name"
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !uploading &&
                              newTagLabel.trim()
                            ) {
                              handleCreateAndAddTag();
                            }
                          }}
                          disabled={uploading || creatingTags}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCreateAndAddTag}
                          disabled={
                            uploading || creatingTags || !newTagLabel.trim()
                          }
                        >
                          {creatingTags ? "Adding..." : "Add Tag"}
                        </Button>
                      </div>
                      {tagCreateError && (
                        <div className="text-xs text-destructive">
                          {tagCreateError}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
                  {uploadError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUploadFiles}
                  disabled={uploading || selectedFilesForUpload.length === 0}
                >
                  {uploading ? "Uploading..." : "Upload Files"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFilesForUpload([]);
                    setSelectedTagsForUpload([]);
                    setNewTagLabel("");
                    setUploadError(null);
                    setTagCreateError(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search files"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2 overflow-auto">
                {tagLoading && (
                  <div className="text-xs text-muted-foreground">
                    Loading tags...
                  </div>
                )}
                {!tagLoading &&
                  tags.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() =>
                        setActiveTagFilter(
                          activeTagFilter === t.slug ? null : t.slug
                        )
                      }
                    >
                      <Badge
                        variant={
                          activeTagFilter === t.slug ? "default" : "secondary"
                        }
                      >
                        {t.label}
                      </Badge>
                    </button>
                  ))}
                {activeTagFilter && (
                  <button onClick={() => setActiveTagFilter(null)}>
                    <Badge variant="outline">Clear</Badge>
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-auto">
              {fileLoading && (
                <div className="text-sm text-muted-foreground">
                  Loading files...
                </div>
              )}
              {!fileLoading && filteredFiles.length === 0 && (
                <div className="text-sm text-muted-foreground">No files</div>
              )}
              {!fileLoading &&
                filteredFiles.map((f) => {
                  const metaTags = f.meta?.tags;
                  const hasTags =
                    Array.isArray(metaTags) && metaTags.length > 0;
                  const uploadedDate = f.uploaded_at
                    ? format(new Date(f.uploaded_at), "MMM d, yyyy")
                    : null;

                  return (
                    <div
                      key={f.id}
                      className={`p-2 rounded hover:bg-accent ${
                        selectedFileId === f.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="truncate flex-1 text-sm font-medium">
                          {f.file_name || f.id}
                        </div>
                        {uploadedDate && (
                          <div className="text-xs text-muted-foreground ml-2">
                            {uploadedDate}
                          </div>
                        )}
                      </div>
                      {hasTags && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {metaTags?.map((tagSlug) => {
                            const tag = tags.find((t) => t.slug === tagSlug);
                            return tag ? (
                              <Badge
                                key={tagSlug}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag.label}
                              </Badge>
                            ) : (
                              <Badge
                                key={tagSlug}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tagSlug}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFileId(f.id);
                          }}
                          className="h-7 text-xs"
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAttachFileToChat?.(f.id);
                          }}
                          disabled
                          className="h-7 text-xs"
                        >
                          Chat
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedFile && (
              <div className="text-sm text-muted-foreground">
                Select a file to preview
              </div>
            )}
            {selectedFile && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {selectedFile.file_name || selectedFile.id}
                    </div>
                    {selectedFile.uploaded_at && (
                      <div className="text-xs text-muted-foreground">
                        {format(
                          new Date(selectedFile.uploaded_at),
                          "MMM d, yyyy HH:mm"
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {selectedFile.meta && (
                  <div className="space-y-3 text-sm">
                    {selectedFile.meta.summary_short && (
                      <div>
                        <div className="font-medium mb-1">Summary</div>
                        <div className="text-muted-foreground">
                          {selectedFile.meta.summary_short}
                        </div>
                      </div>
                    )}
                    {selectedFile.meta.tags &&
                      Array.isArray(selectedFile.meta.tags) &&
                      selectedFile.meta.tags.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedFile.meta.tags.map((tagSlug) => {
                              const tag = tags.find((t) => t.slug === tagSlug);
                              return tag ? (
                                <Badge
                                  key={tagSlug}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag.label}
                                </Badge>
                              ) : (
                                <Badge
                                  key={tagSlug}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tagSlug}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    {selectedFile.meta.folders &&
                      Array.isArray(selectedFile.meta.folders) &&
                      selectedFile.meta.folders.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Folders</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedFile.meta.folders.map((folder) => (
                              <Badge
                                key={folder}
                                variant="outline"
                                className="text-xs"
                              >
                                {folder}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {selectedFile.meta.table_of_contents &&
                      Array.isArray(selectedFile.meta.table_of_contents) &&
                      selectedFile.meta.table_of_contents.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">
                            Table of Contents
                          </div>
                          <div className="space-y-1">
                            {selectedFile.meta.table_of_contents
                              .slice(0, 5)
                              .map((toc, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-muted-foreground"
                                >
                                  {"  ".repeat((toc.level || 1) - 1)}
                                  {toc.title}
                                </div>
                              ))}
                            {selectedFile.meta.table_of_contents.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{" "}
                                {selectedFile.meta.table_of_contents.length - 5}{" "}
                                more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Markdown Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={md !== undefined ? md : localMd}
            onChange={(e) => {
              const value = e.target.value;
              setLocalMd(value);
              onMdChange?.(value);
            }}
            rows={8}
            placeholder="# Notes"
          />
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleOpenIngestDialog}
                disabled={!(md !== undefined ? md : localMd).trim()}
              >
                Save to ingest
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLocalMd("");
                  onMdChange?.("");
                  setIngestError(null);
                }}
              >
                Clear
              </Button>
            </div>
            {ingestError && (
              <div className="text-xs text-destructive">{ingestError}</div>
            )}
          </div>
          {(md !== undefined ? md : localMd) && (
            <div className="prose prose-sm max-w-none dark:prose-invert border rounded p-3">
              <pre className="whitespace-pre-wrap text-sm">
                {md !== undefined ? md : localMd}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Markdown to Ingest</DialogTitle>
            <DialogDescription>
              Enter a filename and optionally add tags for this markdown file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="markdown-filename">File name</Label>
              <Input
                id="markdown-filename"
                value={markdownFileName}
                onChange={(e) => setMarkdownFileName(e.target.value)}
                placeholder="my-file.md"
                disabled={ingestingMarkdown}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              {tagLoading ? (
                <div className="text-xs text-muted-foreground">
                  Loading tags...
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <button
                        key={t.slug}
                        onClick={() => handleToggleTagForMarkdown(t.slug)}
                        disabled={ingestingMarkdown}
                      >
                        <Badge
                          variant={
                            selectedTagsForMarkdown.includes(t.slug)
                              ? "default"
                              : "secondary"
                          }
                        >
                          {t.label}
                        </Badge>
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        No tags available
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Create new tag:</div>
                    <div className="flex gap-2">
                      <Input
                        value={newTagLabelForMarkdown}
                        onChange={(e) => {
                          setNewTagLabelForMarkdown(e.target.value);
                          setTagCreateErrorForMarkdown(null);
                        }}
                        placeholder="Enter new tag name"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !ingestingMarkdown &&
                            newTagLabelForMarkdown.trim()
                          ) {
                            handleCreateAndAddTagForMarkdown();
                          }
                        }}
                        disabled={ingestingMarkdown || creatingTagForMarkdown}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCreateAndAddTagForMarkdown}
                        disabled={
                          ingestingMarkdown ||
                          creatingTagForMarkdown ||
                          !newTagLabelForMarkdown.trim()
                        }
                      >
                        {creatingTagForMarkdown ? "Adding..." : "Add Tag"}
                      </Button>
                    </div>
                    {tagCreateErrorForMarkdown && (
                      <div className="text-xs text-destructive">
                        {tagCreateErrorForMarkdown}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {ingestError && (
              <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
                {ingestError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowIngestDialog(false);
                setIngestError(null);
              }}
              disabled={ingestingMarkdown}
            >
              Cancel
            </Button>
            <Button
              onClick={handleIngestMarkdown}
              disabled={ingestingMarkdown || !markdownFileName.trim()}
            >
              {ingestingMarkdown ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
