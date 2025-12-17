"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function useProjectList(heapId: string | null) {
  return useQuery<ChatSession[], Error>({
    queryKey: ["projects", heapId],
    queryFn: async () => {
      if (!heapId) {
        return [];
      }

      const response = await fetch(`/api/heaps/${heapId}/chat-sessions`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load projects");
      }

      const json = (await response.json()) as ApiResponse<ChatSession[]>;
      return json.data || [];
    },
    enabled: Boolean(heapId),
    staleTime: 30_000,
  });
}

export function useProjectUpdate() {
  const queryClient = useQueryClient();

  return useMutation<
    ChatSession,
    Error,
    { heapId: string; sessionId: string; title: string }
  >({
    mutationFn: async ({ heapId, sessionId, title }) => {
      const response = await fetch(
        `/api/heaps/${heapId}/chat-sessions/${sessionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update project");
      }

      const json = (await response.json()) as ApiResponse<ChatSession>;
      if (!json.data) {
        throw new Error("Invalid update response");
      }

      return json.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate projects list for this heap
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.heapId],
      });
    },
  });
}

