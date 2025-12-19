"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import type { Space, Tag, Member } from "./types";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useHeapInvites, useCreateInvite, type HeapInvite } from "@/hooks/useInvites";
import { createClient } from "@/lib/supabase/client";
import { MemberDetails } from "./member-details";

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

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [currentUserMembership, setCurrentUserMembership] = useState<Member | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: invites, isLoading: invitesLoading } = useHeapInvites(heapId);

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

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    void getCurrentUser();
  }, []);

  // Load members and current user's membership
  useEffect(() => {
    if (!heapId) {
      setMembers([]);
      setCurrentUserMembership(null);
      return;
    }

    let mounted = true;
    (async () => {
      setMembersLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/members`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) {
          const membersData = json.data || [];
          setMembers(membersData);
          
          // Find current user's membership
          if (currentUserId) {
            const userMembership = membersData.find(
              (m: Member) => m.user_id === currentUserId
            );
            setCurrentUserMembership(userMembership || null);
          }
        }
      } finally {
        if (mounted) setMembersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [heapId, currentUserId]);

  // Filter open invites (not expired and not used)
  const openInvites = invites?.filter(
    (invite) => !invite.is_expired && !invite.is_used
  ) || [];

  // Check if current user is admin or owner
  const isAdminOrOwner = currentUserMembership?.role === "admin" || currentUserMembership?.role === "owner";
  
  // Refresh members after update
  const handleMemberUpdate = () => {
    if (!heapId) return;
    fetch(`/api/heaps/${heapId}/members`)
      .then((res) => res.json())
      .then((json) => {
        const membersData = json.data || [];
        setMembers(membersData);
        if (currentUserId) {
          const userMembership = membersData.find(
            (m: Member) => m.user_id === currentUserId
          );
          setCurrentUserMembership(userMembership || null);
        }
      })
      .catch(() => {});
  };

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
    <ResizablePanelGroup direction="vertical" className="flex min-h-screen">
      <ResizablePanel defaultSize={60} minSize={20}>
        <div className="h-full overflow-y-auto">
          <div className="space-y-4">
            <div className="px-3 py-4">
              <div className="mb-4 font-semibold text-foreground">Settings</div>
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
              <div className="mb-4 font-semibold text-foreground">Tags</div>
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
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="h-full overflow-y-auto">
          {isAdminOrOwner ? (
            <>
              <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
                <h3 className="font-semibold text-foreground">Members</h3>
                <CreateInviteDialog heapId={heapId} />
              </header>
              <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
                {membersLoading && (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}
                {!membersLoading && members.length === 0 && openInvites.length === 0 && (
                  <div className="text-sm text-muted-foreground">No members</div>
                )}
                {!membersLoading &&
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
          ) : (
            <>
              <header className="gap-4 border-b w-full px-3 py-4">
                <h3 className="font-semibold text-foreground">Members</h3>
              </header>
              <div className="space-y-4">
                {membersLoading && (
                  <div className="text-sm text-muted-foreground px-3 py-4">Loading...</div>
                )}
                {!membersLoading && currentUserMembership && (
                  <>
                    <div className="px-3 py-4 border-b">
                      <div className="text-sm">
                        <span className="font-medium">
                          {currentUserMembership.display_name || currentUserMembership.user_name || currentUserMembership.user_email}
                        </span>
                        <span className="text-muted-foreground"> — {currentUserMembership.role}</span>
                      </div>
                    </div>
                    <MemberDetails
                      heapId={heapId}
                      membershipId={currentUserMembership.membership_id}
                      initialDisplayName={currentUserMembership.display_name}
                      initialMemberBio={currentUserMembership.member_bio}
                      onUpdate={handleMemberUpdate}
                    />
                  </>
                )}
                {!membersLoading && !currentUserMembership && (
                  <div className="text-sm text-muted-foreground px-3 py-4">
                    Unable to load membership information
                  </div>
                )}
              </div>
            </>
          )}
          {/* Show MemberDetails for admin/owner too */}
          {isAdminOrOwner && currentUserMembership && (
            <div className="border-t">
              <MemberDetails
                heapId={heapId}
                membershipId={currentUserMembership.membership_id}
                initialDisplayName={currentUserMembership.display_name}
                initialMemberBio={currentUserMembership.member_bio}
                onUpdate={handleMemberUpdate}
              />
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
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
              <SelectContent>
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
