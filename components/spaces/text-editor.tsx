"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type TextEditorProps = {
  heapId: string;
};

export function TextEditor({ heapId }: TextEditorProps) {
  const queryClient = useQueryClient();
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!heapId || !markdown.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `/api/heaps/${heapId}/injest/markdown`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown,
            file_name: fileName.trim() || undefined,
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
      setSuccess(true);
      setMarkdown("");
      setFileName("");
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
          Draft markdown and ingest it into this heap.
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
          Markdown saved.
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

