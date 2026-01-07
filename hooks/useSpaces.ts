"use client";

import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Tag } from "../components/spaces/types";

const USER_HEAPS_QUERY_KEY = ["user-heaps"];

type HeapApiResponse =
  | {
      data?: Record<string, unknown>;
    }
  | {
      data?: Array<Record<string, unknown>>;
    };

function normalizeSpace(entry: Record<string, unknown>): Space | null {
  if ("heap_id" in entry && "heap_name" in entry) {
    return {
      id: String(entry.heap_id),
      name: String(entry.heap_name ?? ""),
      description:
        typeof entry.description === "string" ? entry.description : null,
    };
  }

  if ("id" in entry && "name" in entry) {
    return {
      id: String(entry.id),
      name: String(entry.name ?? ""),
      description:
        typeof entry.description === "string" ? entry.description : null,
    };
  }

  return null;
}

export function useUserHeaps(): UseQueryResult<Space[], Error> {
  return useQuery<Space[], Error>({
    queryKey: USER_HEAPS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/heaps?mine=1", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load spaces");
      }

      const json = (await response.json()) as HeapApiResponse;
      const data = Array.isArray(json?.data) ? json.data : [];

      return data
        .map((entry) =>
          entry && typeof entry === "object" ? normalizeSpace(entry) : null
        )
        .filter((item): item is Space => item !== null);
    },
  });
}

export function useHeap(heapId: string | null): UseQueryResult<Space, Error> {
  return useQuery<Space, Error>({
    queryKey: ["heap", heapId],
    queryFn: async () => {
      if (!heapId) {
        throw new Error("Space id is required");
      }

      const response = await fetch(`/api/heaps/${heapId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load the selected space");
      }

      const json = (await response.json()) as HeapApiResponse;
      const entry =
        json && typeof json === "object" && !Array.isArray(json.data)
          ? json.data
          : undefined;

      if (!entry) {
        throw new Error("Space not found");
      }

      const normalized = normalizeSpace(entry);
      if (!normalized) {
        throw new Error("Space response is invalid");
      }

      return normalized;
    },
    enabled: Boolean(heapId),
  });
}

export function useCreateSpace() {
  return useMutation<
    Space,
    Error,
    { name: string; description: string | null; tags?: string }
  >({
    mutationFn: async ({ name, description, tags }) => {
      const createRes = await fetch("/api/heaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description || null,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok)
        throw new Error(createJson.error || "Failed to create space");
      const createdData = createJson.data;
      const created: Space = {
        id:
          typeof createdData === "object" && createdData !== null
            ? String(createdData.id)
            : String(createdData),
        name:
          typeof createdData === "object" && createdData !== null
            ? createdData.name ?? name.trim()
            : name.trim(),
        description:
          typeof createdData === "object" && createdData !== null
            ? createdData.description ?? null
            : description || null,
      };

      const tagList = tags
        ? tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      if (tagList.length) {
        await Promise.all(
          tagList.map(async (label) => {
            const slug = label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            await fetch(`/api/heaps/${created.id}/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ label, slug, is_active: true }),
            });
          })
        );
      }

      return created;
    },
  });
}

export function useSpaceTags(heapId: string | null): UseQueryResult<Tag[], Error> {
  return useQuery<Tag[], Error>({
    queryKey: ["space-tags", heapId],
    queryFn: async () => {
      if (!heapId) {
        return [];
      }

      const response = await fetch(`/api/heaps/${heapId}/tags`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load tags");
      }

      const json = (await response.json()) as { data?: Array<Record<string, unknown>> };
      return (json.data || []).map((tag) => ({
        slug: String(tag.slug ?? ""),
        label: String(tag.label ?? ""),
      }));
    },
    enabled: Boolean(heapId),
    staleTime: 30_000,
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation<
    Space,
    Error,
    { heapId: string; name?: string; description?: string | null }
  >({
    mutationFn: async ({ heapId, name, description }) => {
      const body: Record<string, unknown> = {};
      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description ?? null;

      const response = await fetch(`/api/heaps/${heapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        const message =
          (json && typeof json === "object" && "error" in json
            ? String(json.error)
            : null) ?? "Failed to save space settings";
        throw new Error(message);
      }

      const json = (await response.json()) as HeapApiResponse;
      const entry =
        json && typeof json === "object" && !Array.isArray(json.data)
          ? json.data
          : undefined;

      if (!entry) {
        throw new Error("Invalid update response");
      }

      const normalized = normalizeSpace(entry);
      if (!normalized) {
        throw new Error("Space response is invalid");
      }

      return normalized;
    },
    onSuccess: (updatedSpace, variables) => {
      // Invalidate space query
      queryClient.invalidateQueries({
        queryKey: ["heap", variables.heapId],
      });
      
      // Optimistically update the space in the user-heaps list
      queryClient.setQueryData<Space[] | undefined>(
        USER_HEAPS_QUERY_KEY,
        (prev) => {
          if (!prev) return prev;
          return prev.map((space) =>
            space.id === variables.heapId ? updatedSpace : space
          );
        }
      );
      
      // Also invalidate to ensure fresh data is fetched
      queryClient.invalidateQueries({
        queryKey: USER_HEAPS_QUERY_KEY,
      });
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Tag,
    Error,
    { heapId: string; label: string; slug: string }
  >({
    mutationFn: async ({ heapId, label, slug }) => {
      const response = await fetch(`/api/heaps/${heapId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, slug, is_active: true }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to add tag" }));
        throw new Error(
          typeof error?.error === "string" ? error.error : "Failed to add tag"
        );
      }

      const json = (await response.json()) as { data?: Record<string, unknown> };
      return {
        slug: String(json?.data?.slug ?? slug),
        label: String(json?.data?.label ?? label),
      };
    },
    onSuccess: (_, variables) => {
      // Invalidate tags list for this heap
      queryClient.invalidateQueries({
        queryKey: ["space-tags", variables.heapId],
      });
    },
  });
}

export { USER_HEAPS_QUERY_KEY };

