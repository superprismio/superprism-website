"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useSpaceFiles } from "@/hooks/useSpaceFiles";
import { useProject, useProjectUpdate } from "@/hooks/useProjects";

type TextEditorProps = {
  heapId: string;
  initialMarkdown?: string;
  fileId?: string;
  initialFileName?: string;
  sessionId?: string;
};

export function TextEditor({
  heapId,
  initialMarkdown,
  fileId,
  initialFileName,
  sessionId,
}: TextEditorProps) {
  const { saveMarkdown } = useSpaceFiles(heapId);
  const { data: sessionData } = useProject(heapId, sessionId || null);
  const updateProject = useProjectUpdate();
  const [markdown, setMarkdown] = useState(initialMarkdown || "");

  useEffect(() => {
    if (initialMarkdown !== undefined) {
      setMarkdown(initialMarkdown);
    }
  }, [initialMarkdown]);

  const [fileName, setFileName] = useState(initialFileName || "");

  useEffect(() => {
    if (initialFileName !== undefined) {
      setFileName(initialFileName);
    }
  }, [initialFileName]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = Boolean(fileId);

  const handleSave = async () => {
    if (!heapId || !markdown.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Generate fileId for creates (matches server-side generation)
      const fileIdToUse = isEditMode ? fileId : crypto.randomUUID();

      await saveMarkdown({
        markdown,
        fileName: fileName.trim() || undefined,
        fileId: fileIdToUse || undefined,
        fileOp: isEditMode ? "update" : "create",
        fileFolders: sessionId ? ["artifacts"] : undefined,
      });

      // If sessionId is provided, update the chat session with the file_id
      if (sessionId && fileIdToUse) {
        try {
          let currentFileIds: string[] = [];
          let existingMeta: Record<string, unknown> = {};

          // Use session data from hook if available
          if (sessionData) {
            const meta = sessionData.meta;
            if (meta && typeof meta === "object" && !Array.isArray(meta)) {
              existingMeta = { ...meta };
              const existingFileIds = meta.file_id;
              if (Array.isArray(existingFileIds)) {
                // Filter and convert to string array, handling Json type
                currentFileIds = existingFileIds.filter(
                  (id): id is string => typeof id === "string"
                );
              }
            }
          }

          // Add new file_id if not already present
          if (!currentFileIds.includes(fileIdToUse)) {
            currentFileIds.push(fileIdToUse);
          }

          // Update session with new meta, preserving other meta fields
          await updateProject.mutateAsync({
            heapId,
            sessionId,
            meta: {
              ...existingMeta,
              file_id: currentFileIds,
            },
          });
        } catch (sessionError) {
          console.error("Error updating chat session:", sessionError);
          // Don't throw - file was saved successfully, session update is secondary
        }
      }

      setSuccess(true);
      if (!isEditMode) {
        setMarkdown("");
        setFileName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save markdown");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h4 className="text-lg font-semibold text-foreground">Text Editor</h4>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Edit markdown file."
            : "Draft markdown and ingest it into this heap."}
        </p>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Optional file name (defaults to markdown-*.md)"
          value={fileName}
          onChange={(event) => {
            setFileName(event.target.value);
            setSuccess(false);
          }}
          disabled={saving}
        />
        <Textarea
          rows={12}
          placeholder="# Notes"
          value={markdown}
          onChange={(event) => {
            setMarkdown(event.target.value);
            setSuccess(false);
          }}
          disabled={saving}
        />
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded border border-green-500/50 bg-green-500/10 p-2 text-sm text-green-600">
          {isEditMode ? "File updated." : "Markdown saved."}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !markdown.trim()}
          className="flex-1"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setMarkdown("");
            setFileName("");
            setError(null);
            setSuccess(false);
          }}
          disabled={saving}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
