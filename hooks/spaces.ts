"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Space } from "../components/spaces/types";

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

export { USER_HEAPS_QUERY_KEY };
