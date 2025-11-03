"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Heap } from "./types";

export function CreateHeapDialog({
  onCreated,
}: {
  onCreated?: (heap: Heap) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTagsCsv, setNewTagsCsv] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreateHeap() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const createRes = await fetch("/api/heaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription || null,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok)
        throw new Error(createJson.error || "Failed to create heap");
      const created: Heap = createJson.data;

      const tagList = newTagsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (tagList.length) {
        await Promise.all(
          tagList.map(async (label) => {
            const slug = label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            await fetch(`/api/heaps/${created.id}/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ label, slug, is_active: true }),
            });
          })
        );
      }
      setOpen(false);
      setNewName("");
      setNewDescription("");
      setNewTagsCsv("");
      router.push(`/heaps/${created.id}`);
      onCreated?.(created);
    } catch (e) {
      // no-op minimal error handling
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Heap</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <div className="text-sm mb-1">Name</div>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project wiki"
            />
          </div>
          <div>
            <div className="text-sm mb-1">Description</div>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div>
            <div className="text-sm mb-1">Tags (comma separated)</div>
            <Input
              value={newTagsCsv}
              onChange={(e) => setNewTagsCsv(e.target.value)}
              placeholder="design, research, roadmap"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateHeap}
            disabled={creating || !newName.trim()}
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

