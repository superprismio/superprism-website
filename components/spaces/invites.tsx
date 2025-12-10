"use client";

import { useState } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { usePendingInvites, useCreateInvite, useIsHeapOwner } from "@/hooks/useMembership";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Copy, Check } from "lucide-react";

export function Invites({ heapId }: WorkspacePaneComponentProps) {
  const { data: isOwner, isLoading: isOwnerLoading } = useIsHeapOwner(heapId);
  const { data: invites, isLoading: invitesLoading } = usePendingInvites(heapId);
  const createInvite = useCreateInvite(heapId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Don't show if not owner
  if (isOwnerLoading) {
    return (
      <div className="px-3 py-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

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

      // Reset form
      setEmail("");
      setRole("member");
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
    <div className="space-y-4">
      <div className="px-3 py-4">
        <div className="mb-4 font-semibold">Invites</div>

        {/* Create Invite Form */}
        <div className="mb-6 space-y-3">
          <div className="text-sm font-medium">Create new invite</div>
          <form onSubmit={handleCreateInvite} className="space-y-3">
            <div>
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
            <div>
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
            <Button
              type="submit"
              size="sm"
              disabled={createInvite.isPending || !email.trim()}
            >
              {createInvite.isPending ? "Creating..." : "Create Invite"}
            </Button>
            {createInvite.error && (
              <div className="text-sm text-destructive">
                {createInvite.error.message}
              </div>
            )}
          </form>
        </div>

        {/* Pending Invites List */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Pending invites</div>
          {invitesLoading ? (
            <div className="text-sm text-muted-foreground">Loading invites...</div>
          ) : !invites || invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending invites</div>
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
      </div>
    </div>
  );
}
