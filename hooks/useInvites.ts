"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Invite = {
  id: string;
  heap_id: string;
  email: string | null;
  token: string | null;
  expires_at: string | null;
  used_at: string | null;
  used_by: string | null;
  invited_by: string;
  role: string | null;
  created_at: string | null;
  isExpired?: boolean;
  isUsed?: boolean;
  heap?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

export type HeapInvite = {
  invite_id: string;
  heap_id: string;
  email: string;
  token: string;
  role: string;
  invited_by_email: string;
  invited_by_name: string;
  created_at: string;
  expires_at: string;
  used_at: string;
  is_expired: boolean;
  is_used: boolean;
};

type CreateInviteRequest = {
  email: string;
  role?: string;
  expiresInDays?: number;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function useInviteDetails(token: string | null) {
  return useQuery<Invite, Error>({
    queryKey: ["invite", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }

      const response = await fetch(`/api/invites/${token}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load invite");
      }

      const json = (await response.json()) as ApiResponse<Invite>;
      if (!json.data) {
        throw new Error("Invalid invite response");
      }

      return json.data;
    },
    enabled: Boolean(token),
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (token: string) => {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept invite");
      }

      const json = (await response.json()) as ApiResponse<unknown>;
      return json.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user-heaps"] });
      queryClient.invalidateQueries({ queryKey: ["heap-invites"] });
    },
  });
}

export function useHeapInvites(heapId: string | null) {
  return useQuery<HeapInvite[], Error>({
    queryKey: ["heap-invites", heapId],
    queryFn: async () => {
      if (!heapId) {
        throw new Error("Heap ID is required");
      }

      const response = await fetch(`/api/heaps/${heapId}/invites`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load invites");
      }

      const json = (await response.json()) as ApiResponse<HeapInvite[]>;
      return json.data || [];
    },
    enabled: Boolean(heapId),
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { heapId: string; invite: CreateInviteRequest }
  >({
    mutationFn: async ({ heapId, invite }) => {
      const response = await fetch(`/api/heaps/${heapId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invite),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invite");
      }

      const json = (await response.json()) as ApiResponse<unknown>;
      return json.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate invites list for this heap
      queryClient.invalidateQueries({
        queryKey: ["heap-invites", variables.heapId],
      });
    },
  });
}
