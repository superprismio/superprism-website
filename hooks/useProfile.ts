"use client";

import { useMemo } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { useSpaceMembers } from "@/hooks/useMembers";

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
 * 1. Member display_name (if heapId provided and user is a member)
 * 2. User profile name
 * 3. Truncated user ID
 */
export function useUserDisplayName(
  userId: string | null,
  heapId?: string | null
): string {
  // Fetch member data if heapId is provided
  const { data: members = [] } = useSpaceMembers(heapId ?? null);
  
  // Fetch profile data
  const { data: profile } = useProfile(userId);

  return useMemo(() => {
    if (!userId) return "Unknown";

    // Priority 1: Check member display_name
    if (heapId) {
      const member = members.find((m) => m.user_id === userId);
      if (member?.display_name) {
        return member.display_name;
      }
    }

    // Priority 2: Check user profile name
    if (profile?.name) {
      return profile.name;
    }

    // Priority 3: Fall back to truncated user ID
    return truncateUserId(userId);
  }, [userId, heapId, members, profile]);
}

/**
 * Gets display names for multiple users efficiently.
 * Returns a mapping of userId -> displayName.
 * Uses members data for display_name, then fetches profiles for remaining users.
 */
export function useUserDisplayNames(
  userIds: string[],
  heapId?: string | null
): Record<string, string> {
  const { data: members = [] } = useSpaceMembers(heapId ?? null);
  
  // Get unique user IDs that aren't in members (or don't have display_name)
  const userIdsNeedingProfiles = useMemo(() => {
    const memberUserIds = new Set(
      members
        .filter((m) => m.display_name)
        .map((m) => m.user_id)
    );
    return userIds.filter((id) => !memberUserIds.has(id));
  }, [userIds, members]);

  // Batch fetch profiles for users not in members
  const { data: profiles = [] } = useQuery<UserProfile[], Error>({
    queryKey: ["user-profiles-batch", userIdsNeedingProfiles],
    queryFn: async () => {
      if (userIdsNeedingProfiles.length === 0) return [];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .in("user_id", userIdsNeedingProfiles);

      if (error) {
        console.error("Failed to fetch user profiles:", error);
        return [];
      }
      return data || [];
    },
    enabled: userIdsNeedingProfiles.length > 0,
    staleTime: 300_000, // 5 minutes
  });

  return useMemo(() => {
    const displayNames: Record<string, string> = {};
    
    for (const userId of userIds) {
      if (!userId) {
        displayNames[userId] = "Unknown";
        continue;
      }

      // Priority 1: Check member display_name
      if (heapId) {
        const member = members.find((m) => m.user_id === userId);
        if (member?.display_name) {
          displayNames[userId] = member.display_name;
          continue;
        }
      }

      // Priority 2: Check user profile name
      const profile = profiles.find((p) => p.user_id === userId);
      if (profile?.name) {
        displayNames[userId] = profile.name;
        continue;
      }

      // Priority 3: Fall back to truncated user ID
      displayNames[userId] = truncateUserId(userId);
    }

    return displayNames;
  }, [userIds, heapId, members, profiles]);
}

