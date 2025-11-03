"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Heap, Tag } from "./types";

export function SettingsTab({
  heap,
  onHeapChange,
  onSave,
}: {
  heap: Heap | null;
  onHeapChange?: (heap: Heap) => void;
  onSave?: () => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  useEffect(() => {
    if (!heap?.id) {
      setTags([]);
      return;
    }
    let mounted = true;
    (async () => {
      setTagLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heap.id}/tags`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setTags(
            (json.data || []).map((t: any) => ({
              slug: t.slug,
              label: t.label,
            }))
          );
        }
      } finally {
        if (mounted) {
          setTagLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heap?.id]);

  function generateSlug(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleAddTag() {
    if (!heap?.id || !newTagLabel.trim()) return;

    const label = newTagLabel.trim();
    const slug = generateSlug(label);

    // Check if tag already exists
    if (tags.some((t) => t.slug === slug || t.label.toLowerCase() === label.toLowerCase())) {
      setTagError("Tag already exists");
      return;
    }

    setAddingTag(true);
    setTagError(null);
    try {
      const res = await fetch(`/api/heaps/${heap.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, slug, is_active: true }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to add tag" }));
        throw new Error(error.error || "Failed to add tag");
      }

      const json = await res.json();
      setTags((prev) => [...prev, { slug: json.data.slug, label: json.data.label }]);
      setNewTagLabel("");
    } catch (error) {
      setTagError(error instanceof Error ? error.message : "Failed to add tag");
    } finally {
      setAddingTag(false);
    }
  }

  async function handleUpdateHeapDetails() {
    if (!heap) return;
    const res = await fetch(`/api/heaps/${heap.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: heap.description ?? null }),
    });
    if (!res.ok) {
      // minimal handling
    }
    onSave?.();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm mb-1">Description</div>
            <Textarea
              value={heap?.description || ""}
              onChange={(e) =>
                onHeapChange?.(
                  heap
                    ? { ...heap, description: e.target.value }
                    : ({ id: "", name: "", description: e.target.value } as Heap)
                )
              }
              placeholder="Describe this space"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdateHeapDetails}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Add new tag</div>
            <div className="flex gap-2">
              <Input
                value={newTagLabel}
                onChange={(e) => {
                  setNewTagLabel(e.target.value);
                  setTagError(null);
                }}
                placeholder="Enter tag name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
                disabled={addingTag || !heap?.id}
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={addingTag || !newTagLabel.trim() || !heap?.id}
              >
                {addingTag ? "Adding..." : "Add"}
              </Button>
            </div>
            {tagError && (
              <div className="text-sm text-destructive">{tagError}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Existing tags</div>
            {tagLoading ? (
              <div className="text-sm text-muted-foreground">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tags yet</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag.slug} variant="secondary">
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

