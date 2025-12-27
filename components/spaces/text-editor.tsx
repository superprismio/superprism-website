"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type TextEditorProps = {
  heapId: string;
  initialMarkdown?: string;
  fileId?: string;
  initialFileName?: string;
  sessionId?: string;
};

export function TextEditor({ heapId, initialMarkdown, fileId, initialFileName, sessionId }: TextEditorProps) {
  const queryClient = useQueryClient();
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

      const response = await fetch(
        `/api/heaps/${heapId}/injest/markdown`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown,
            file_name: fileName.trim() || undefined,
            file_id: fileIdToUse || undefined,
            file_op: isEditMode ? "update" : "create",
            file_folders: sessionId ? ["artifacts"] : undefined,
          }),
        }
      );

      if (!response.ok) {
        const json = await response
          .json()
          .catch(() => ({ error: "Failed to save markdown" }));
        throw new Error(json.error || "Failed to save markdown");
      }

      await queryClient.invalidateQueries({
        queryKey: ["space-files", heapId],
      });

      // If sessionId is provided, update the chat session with the file_id
      if (sessionId && fileIdToUse) {
        try {
          // Fetch current session to get existing meta
          const sessionResponse = await fetch(
            `/api/heaps/${heapId}/chat-sessions/${sessionId}`
          );
          
          let currentFileIds: string[] = [];
          let existingMeta: Record<string, unknown> = {};
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const meta = sessionData.data?.meta;
            if (meta && typeof meta === "object" && !Array.isArray(meta)) {
              existingMeta = { ...meta };
              const existingFileIds = meta.file_id;
              if (Array.isArray(existingFileIds)) {
                currentFileIds = [...existingFileIds];
              }
            }
          }

          // Add new file_id if not already present
          if (!currentFileIds.includes(fileIdToUse)) {
            currentFileIds.push(fileIdToUse);
          }

          // Update session with new meta, preserving other meta fields
          const updateResponse = await fetch(
            `/api/heaps/${heapId}/chat-sessions/${sessionId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                meta: {
                  ...existingMeta,
                  file_id: currentFileIds,
                },
              }),
            }
          );

          if (!updateResponse.ok) {
            console.error("Failed to update chat session with file_id");
            // Don't throw - file was saved successfully, session update is secondary
          }
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
          {isEditMode ? "Edit markdown file." : "Draft markdown and ingest it into this heap."}
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

      <div className="mt-auto flex gap-2">
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

