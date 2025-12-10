"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { useEffect, useState } from "react";
import type { Member } from "./types";
import { Button } from "../ui/button";
import { PlusIcon, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { usePendingInvites, useCreateInvite, useIsHeapOwner } from "@/hooks/useMembership";

export function SpaceMembers({ heapId }: WorkspacePaneComponentProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { data: isOwner, isLoading: isOwnerLoading } = useIsHeapOwner(heapId);
  const { data: invites, isLoading: invitesLoading } = usePendingInvites(heapId);
  const createInvite = useCreateInvite(heapId);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/members`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setMembers(json.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId]);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const result = await createInvite.mutateAsync({
        email: email.trim(),
        role,
      });

      // Copy link to clipboard
      if (result.invite_link) {
        await navigator.clipboard.writeText(result.invite_link);
        setCopiedLink(result.invite_link);
        setTimeout(() => setCopiedLink(null), 2000);
      }

      // Reset form and close dialog
      setEmail("");
      setRole("member");
      setInviteDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create invite:", error);
    }
  }

  async function handleCopyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Members</h3>
        {!isOwnerLoading && isOwner && (
          <Button
            size="sm"
            onClick={() => setInviteDialogOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Invite member
          </Button>
        )}
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!loading && members.length === 0 && (
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

        {/* Pending Invites Section */}
        {!isOwnerLoading && isOwner && (
          <div className="mt-6 pt-6 border-t">
            <div className="mb-3 text-sm font-medium">Pending Invites</div>
            {invitesLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading invites...
              </div>
            ) : !invites || invites.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No pending invites
              </div>
            ) : (
              <div className="space-y-2">
                {invites.map((invite) => {
                  const baseUrl =
                    typeof window !== "undefined"
                      ? window.location.origin
                      : "https://superprism.io";
                  const inviteLink = `${baseUrl}/invite/${invite.token}`;
                  const isCopied = copiedLink === inviteLink;

                  return (
                    <div
                      key={invite.invite_id}
                      className="flex items-center justify-between rounded border p-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{invite.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Role: {invite.role}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(inviteLink)}
                        className="ml-2"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Create an invite link to add a new member to this space.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvite}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={createInvite.isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as "member" | "owner")}
                  disabled={createInvite.isPending}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createInvite.error && (
                <div className="text-sm text-destructive">
                  {createInvite.error.message}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={createInvite.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvite.isPending || !email.trim()}
              >
                {createInvite.isPending ? "Creating..." : "Create Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

