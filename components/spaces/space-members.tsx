"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { useState } from "react";
import { Button } from "../ui/button";
import { PlusIcon, CopyIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useHeapInvites,
  useCreateInvite,
  type HeapInvite,
} from "@/hooks/useInvites";
import { useSpaceMembers } from "@/hooks/useMembers";

export function SpaceMembers({ heapId }: WorkspacePaneComponentProps) {
  const { data: members = [], isLoading: loading } = useSpaceMembers(heapId);
  const { data: invites, isLoading: invitesLoading } = useHeapInvites(heapId);

  // Filter open invites (not expired and not used)
  const openInvites =
    invites?.filter((invite) => !invite.is_expired && !invite.is_used) || [];

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Members</h3>
        <CreateInviteDialog heapId={heapId} />
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!loading && members.length === 0 && openInvites.length === 0 && (
          <div className="text-sm text-muted-foreground">No members</div>
        )}
        {!loading &&
          members.map((m) => (
            <div key={m.membership_id} className="text-sm">
              <span className="font-medium">
                {m.display_name || m.user_name || m.user_email}
              </span>
              <span className="text-muted-foreground"> — {m.role}</span>
            </div>
          ))}
        {openInvites.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Open Invites
            </div>
            {openInvites.map((invite) => (
              <InviteRow key={invite.invite_id} invite={invite} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function CreateInviteDialog({ heapId }: { heapId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState<string | null>(null);
  const createInvite = useCreateInvite();

  const handleCreate = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setError(null);
    try {
      await createInvite.mutateAsync({
        heapId,
        invite: {
          email: email.trim(),
          role,
          expiresInDays: 7,
        },
      });
      setOpen(false);
      setEmail("");
      setRole("member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this space.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createInvite.isPending || !email.trim()}
          >
            {createInvite.isPending ? "Creating..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteRow({ invite }: { invite: HeapInvite }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${invite.token}`
      : `/invite/${invite.token}`;

  const handleCopy = async () => {
    if (typeof window === "undefined") return;

    const fullUrl = `${window.location.origin}/invite/${invite.token}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between text-sm py-2">
      <div>
        <span className="font-medium">{invite.email}</span>
        <span className="text-muted-foreground"> — {invite.role}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        title={copied ? "Copied!" : "Copy invite link"}
      >
        <CopyIcon className="h-4 w-4" />
        <span className="sr-only">Copy invite link</span>
      </Button>
    </div>
  );
}
