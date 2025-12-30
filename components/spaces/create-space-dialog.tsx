"use client";

import { ReactNode, useState } from "react";
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
import { Space } from "./types";
import { useCreateSpace } from "@/hooks/useSpaces";

export function CreateSpaceDialog({
  onCreated,
  trigger,
}: {
  onCreated?: (space: Space) => void;
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTagsCsv, setNewTagsCsv] = useState("");
  const createSpace = useCreateSpace();

  async function handleCreateHeap() {
    if (!newName.trim()) return;
    try {
      const created = await createSpace.mutateAsync({
        name: newName.trim(),
        description: newDescription || null,
        tags: newTagsCsv,
      });
      setOpen(false);
      setNewName("");
      setNewDescription("");
      setNewTagsCsv("");
      router.push(`/dashboard/${created.id}`);
      onCreated?.(created);
    } catch (e) {
      // no-op minimal error handling
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">New Space</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Space</DialogTitle>
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
            disabled={createSpace.isPending || !newName.trim()}
          >
            {createSpace.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
