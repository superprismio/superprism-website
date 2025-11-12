"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import type { Space, Tag } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

export function SpaceSettings({ heapId }: WorkspacePaneComponentProps) {
  const [space, setSpace] = useState<Space | null>(null);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [spaceError, setSpaceError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  useEffect(() => {
    if (!heapId) {
      setSpace(null);
      setTags([]);
      return;
    }

    let mounted = true;

    (async () => {
      setSpaceLoading(true);
      setSpaceError(null);
      try {
        const res = await fetch(`/api/heaps/${heapId}`);
        if (!res.ok) {
          throw new Error("Failed to load space details");
        }
        const json = await res.json();
        if (!mounted) return;
        const data = json?.data;
        if (data && typeof data === "object") {
          setSpace({
            id: String(data.id ?? heapId),
            name: String(data.name ?? ""),
            description:
              typeof data.description === "string" ? data.description : null,
          });
        } else {
          setSpaceError("Space not found");
        }
      } catch (error) {
        if (mounted) {
          setSpaceError(
            error instanceof Error
              ? error.message
              : "Failed to load space details"
          );
        }
      } finally {
        if (mounted) {
          setSpaceLoading(false);
        }
      }
    })();

    (async () => {
      setTagLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/tags`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setTags(
            (json.data || []).map((tag: Record<string, unknown>) => ({
              slug: String(tag.slug ?? ""),
              label: String(tag.label ?? ""),
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
  }, [heapId]);

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    setSpace((prev) =>
      prev
        ? { ...prev, description: value }
        : { id: heapId, name: "", description: value }
    );
  }

  async function handleSave() {
    if (!heapId) return;
    setSaving(true);
    setSpaceError(null);
    try {
      const res = await fetch(`/api/heaps/${heapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: space?.description ?? null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          (json && typeof json === "object" && "error" in json
            ? String(json.error)
            : null) ?? "Failed to save space settings";
        throw new Error(message);
      }
    } catch (error) {
      setSpaceError(
        error instanceof Error ? error.message : "Failed to save space settings"
      );
    } finally {
      setSaving(false);
    }
  }

  function generateSlug(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleAddTag() {
    if (!heapId || !newTagLabel.trim()) return;

    const label = newTagLabel.trim();
    const slug = generateSlug(label);

    if (
      tags.some(
        (tag) =>
          tag.slug === slug || tag.label.toLowerCase() === label.toLowerCase()
      )
    ) {
      setTagError("Tag already exists");
      return;
    }

    setAddingTag(true);
    setTagError(null);
    try {
      const res = await fetch(`/api/heaps/${heapId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, slug, is_active: true }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to add tag" }));
        throw new Error(
          typeof error?.error === "string" ? error.error : "Failed to add tag"
        );
      }

      const json = await res.json();
      setTags((prev) => [
        ...prev,
        {
          slug: String(json?.data?.slug ?? slug),
          label: String(json?.data?.label ?? label),
        },
      ]);
      setNewTagLabel("");
    } catch (error) {
      setTagError(error instanceof Error ? error.message : "Failed to add tag");
    } finally {
      setAddingTag(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-3 py-4">
        <div>Settings</div>
        <div className="space-y-3">
          {spaceError && (
            <div className="text-sm text-destructive">{spaceError}</div>
          )}
          <div>
            <div className="mb-1 text-sm">Description</div>
            <Textarea
              value={space?.description ?? ""}
              onChange={handleDescriptionChange}
              placeholder="Describe this space"
              disabled={spaceLoading || saving}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || spaceLoading || !heapId}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        <div>Tags</div>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Add new tag</div>
            <div className="flex gap-2">
              <Input
                value={newTagLabel}
                onChange={(event) => {
                  setNewTagLabel(event.target.value);
                  setTagError(null);
                }}
                placeholder="Enter tag name"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={addingTag || !heapId}
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={addingTag || !newTagLabel.trim() || !heapId}
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
              <div className="text-sm text-muted-foreground">
                Loading tags...
              </div>
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
        </div>
      </div>
    </div>
  );
}
