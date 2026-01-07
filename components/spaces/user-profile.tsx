"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { WorkspacePaneComponentProps } from "./workspace-pane-types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

export function UserProfile({ heapId }: WorkspacePaneComponentProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useProfile(
    currentUser?.id ?? null
  );
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync profile name to local state when profile data changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;

    setError(null);
    setSuccess(false);

    try {
      await updateProfile.mutateAsync({
        userId: currentUser.id,
        name: name.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    }
  };

  const saving = updateProfile.isPending;
  const hasChanges = name !== (profile?.name || "");

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4">
        <div className="px-3 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold text-foreground">User Profile</div>
          </div>
          <div className="space-y-3">
            {profileLoading && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
            {!profileLoading && (
              <>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                {success && (
                  <div className="text-sm text-green-600">
                    Profile updated successfully
                  </div>
                )}
                <div>
                  <div className="mb-1 text-sm">Name</div>
                  <Input
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Your display name"
                    disabled={saving}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !currentUser?.id || !hasChanges}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

