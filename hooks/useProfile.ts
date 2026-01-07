"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export function useProfile(
  userId: string | null
): UseQueryResult<UserProfile | null, Error> {
  return useQuery<UserProfile | null, Error>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
      return data;
    },
    enabled: Boolean(userId),
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * Truncates a user ID to a readable format
 * Example: "12345678-1234-1234-1234-123456789abc" -> "12345678...789abc"
 */
function truncateUserId(userId: string): string {
  if (userId.length <= 16) return userId;
  return `${userId.slice(0, 8)}...${userId.slice(-6)}`;
}

/**
 * Gets the display name for a user with fallback priority:
 * 1. User profile name
 * 2. Truncated user ID
 */
export function useUserDisplayName(
  userId: string | null,
  heapId?: string | null
): string {
  // Fetch profile data
  const { data: profile } = useProfile(userId);

  return useMemo(() => {
    if (!userId) return "Unknown";

    // Priority 1: Check user profile name
    if (profile?.name) {
      return profile.name;
    }

    // Priority 2: Fall back to truncated user ID
    return truncateUserId(userId);
  }, [userId, profile]);
}

/**
 * Gets display names for multiple users efficiently.
 * Returns a mapping of userId -> displayName.
 * Uses user profile names, with fallback to truncated user IDs.
 */
export function useUserDisplayNames(
  userIds: string[],
  heapId?: string | null
): Record<string, string> {
  // Get unique user IDs
  const uniqueUserIds = useMemo(() => {
    return Array.from(new Set(userIds.filter(Boolean)));
  }, [userIds]);

  // Batch fetch profiles for all users
  const { data: profiles = [] } = useQuery<UserProfile[], Error>({
    queryKey: ["user-profiles-batch", uniqueUserIds],
    queryFn: async () => {
      if (uniqueUserIds.length === 0) return [];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .in("user_id", uniqueUserIds);

      if (error) {
        console.error("Failed to fetch user profiles:", error);
        return [];
      }
      return data || [];
    },
    enabled: uniqueUserIds.length > 0,
    staleTime: 300_000, // 5 minutes
  });

  return useMemo(() => {
    const displayNames: Record<string, string> = {};
    
    for (const userId of userIds) {
      if (!userId) {
        displayNames[userId] = "Unknown";
        continue;
      }

      // Priority 1: Check user profile name
      const profile = profiles.find((p) => p.user_id === userId);
      if (profile?.name) {
        displayNames[userId] = profile.name;
        continue;
      }

      // Priority 2: Fall back to truncated user ID
      displayNames[userId] = truncateUserId(userId);
    }

    return displayNames;
  }, [userIds, profiles]);
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile,
    Error,
    {
      userId: string;
      name?: string | null;
    }
  >({
    mutationFn: async ({ userId, name }) => {
      const response = await fetch(`/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name?.trim() || null }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        const message =
          (json && typeof json === "object" && "error" in json
            ? String(json.error)
            : null) ?? "Failed to update profile";
        throw new Error(message);
      }

      const json = (await response.json()) as { data?: UserProfile; error?: string };
      if (!json.data) {
        throw new Error("Invalid update response");
      }

      return json.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate profile queries
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profiles-batch"],
      });
    },
  });
}

