"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useUpdateMember } from "@/hooks/useMembers";

type MemberDetailsProps = {
  heapId: string;
  membershipId: string;
  initialDisplayName: string | null;
  initialMemberBio: string | null;
  onUpdate?: () => void;
};

export function MemberDetails({
  heapId,
  membershipId,
  initialDisplayName,
  initialMemberBio,
  onUpdate,
}: MemberDetailsProps) {
  const updateMember = useUpdateMember();
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [memberBio, setMemberBio] = useState(initialMemberBio || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDisplayName(initialDisplayName || "");
    setMemberBio(initialMemberBio || "");
  }, [initialDisplayName, initialMemberBio]);

  async function handleSave() {
    if (!heapId || !membershipId) return;

    setError(null);
    setSuccess(false);

    try {
      await updateMember.mutateAsync({
        heapId,
        membershipId,
        displayName: displayName.trim() || null,
        memberBio: memberBio.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onUpdate?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update member details"
      );
    }
  }

  const saving = updateMember.isPending;

  const hasChanges =
    displayName !== (initialDisplayName || "") ||
    memberBio !== (initialMemberBio || "");

  return (
    <div className="space-y-4 px-3 py-4">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Member Details</h3>
        <p className="text-sm text-muted-foreground">
          Update your display name and bio for this space.
        </p>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {success && (
        <div className="text-sm text-green-600">
          Member details updated successfully
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="display-name">Display Name</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDisplayName(e.target.value)
          }
          placeholder="Enter your display name"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="member-bio">Bio</Label>
        <Textarea
          id="member-bio"
          value={memberBio}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setMemberBio(e.target.value)
          }
          placeholder="Tell others about yourself"
          disabled={saving}
          rows={4}
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
