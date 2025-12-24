"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

type ProjectFolders = {
  yourProjects: ChatSession[];
  spaceProjects: ChatSession[];
};

export function useProjectList(heapId: string | null) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    void getUserId();
  }, []);

  return useQuery<ProjectFolders, Error>({
    queryKey: ["projects", heapId, userId],
    queryFn: async () => {
      if (!heapId) {
        return { yourProjects: [], spaceProjects: [] };
      }

      const response = await fetch(`/api/heaps/${heapId}/chat-sessions`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load projects");
      }

      const json = (await response.json()) as ApiResponse<ChatSession[]>;
      const allProjects = json.data || [];

      // Filter projects where meta.isProject is true
      const projects = allProjects.filter(
        (session) =>
          session.meta &&
          typeof session.meta === "object" &&
          !Array.isArray(session.meta) &&
          (session.meta as Record<string, unknown>).isProject === true
      );

      // Separate by created_by
      const yourProjects: ChatSession[] = [];
      const spaceProjects: ChatSession[] = [];

      for (const project of projects) {
        if (userId && project.created_by === userId) {
          yourProjects.push(project);
        } else {
          spaceProjects.push(project);
        }
      }

      return { yourProjects, spaceProjects };
    },
    enabled: Boolean(heapId) && userId !== null,
    staleTime: 30_000,
  });
}

export function useProjectUpdate() {
  const queryClient = useQueryClient();

  return useMutation<
    ChatSession,
    Error,
    {
      heapId: string;
      sessionId: string;
      title?: string;
      meta?: Record<string, unknown>;
      archived?: boolean;
    }
  >({
    mutationFn: async ({ heapId, sessionId, title, meta, archived }) => {
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (meta !== undefined) updates.meta = meta;
      if (archived !== undefined) updates.archived = archived;

      const response = await fetch(
        `/api/heaps/${heapId}/chat-sessions/${sessionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
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

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<
    ChatSession,
    Error,
    { heapId: string; title: string; fileIds?: string[] }
  >({
    mutationFn: async ({ heapId, title, fileIds = [] }) => {
      const response = await fetch(`/api/heaps/${heapId}/chat-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          meta: {
            isProject: true,
            file_id: fileIds,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create project");
      }

      const json = (await response.json()) as ApiResponse<ChatSession>;
      if (!json.data) {
        throw new Error("Invalid create response");
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
