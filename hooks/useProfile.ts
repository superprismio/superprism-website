"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
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

