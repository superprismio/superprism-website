"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Member } from "@/components/spaces/types";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function useSpaceMembers(heapId: string | null) {
  return useQuery<Member[], Error>({
    queryKey: ["space-members", heapId],
    queryFn: async () => {
      if (!heapId) {
        return [];
      }

      const response = await fetch(`/api/heaps/${heapId}/members`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const json = (await response.json()) as ApiResponse<Member[]>;
        throw new Error(json.error || "Failed to load members");
      }

      const json = (await response.json()) as ApiResponse<Member[]>;
      return json.data || [];
    },
    enabled: Boolean(heapId),
    staleTime: 30_000,
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation<
    Member,
    Error,
    {
      heapId: string;
      membershipId: string;
      displayName?: string | null;
      memberBio?: string | null;
    }
  >({
    mutationFn: async ({ heapId, membershipId, displayName, memberBio }) => {
      const response = await fetch(
        `/api/heaps/${heapId}/members/${membershipId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: displayName?.trim() || null,
            member_bio: memberBio?.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        const message =
          (json && typeof json === "object" && "error" in json
            ? String(json.error)
            : null) ?? "Failed to update member details";
        throw new Error(message);
      }

      const json = (await response.json()) as ApiResponse<Member>;
      if (!json.data) {
        throw new Error("Invalid update response");
      }

      return json.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate members list for this heap
      queryClient.invalidateQueries({
        queryKey: ["space-members", variables.heapId],
      });
    },
  });
}

export function useIsMember(heapId: string | null) {
  return useQuery<boolean, Error>({
    queryKey: ["is-member", heapId],
    queryFn: async () => {
      if (!heapId) {
        return false;
      }

      const response = await fetch(`/api/heaps/${heapId}/members/check`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const json = (await response.json()) as ApiResponse<{ isMember: boolean }>;
        throw new Error(json.error || "Failed to check membership");
      }

      const json = (await response.json()) as ApiResponse<{ isMember: boolean }>;
      return json.data?.isMember ?? false;
    },
    enabled: Boolean(heapId),
    staleTime: 30_000,
  });
}
