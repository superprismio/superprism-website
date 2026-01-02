"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const CURRENT_USER_QUERY_KEY = ["current-user"];

export function useCurrentUser(): UseQueryResult<User | null, Error> {
  return useQuery<User | null, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user ?? null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

