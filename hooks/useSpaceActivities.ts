"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/components/spaces/types";

type ActivityData = {
  id: string;
  cta: Record<string, unknown>;
  title: string;
  status: string;
  heap_id: string;
  metadata: Record<string, unknown>;
  subtitle: string | null;
  action_at: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  visibility: string;
  activity_type: string;
};

type DataRow = {
  id: string;
  data: ActivityData;
  created_at: string | null;
};

type ApiResponse = {
  data: DataRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

function normalizeActivities(dataRows: DataRow[]): Activity[] {
  return dataRows.map((row) => {
    const activityData = row.data;
    return {
      id: activityData.id || row.id,
      title: activityData.title || "",
      subtitle: activityData.subtitle || null,
      activity_type: activityData.activity_type || "",
      created_at: activityData.created_at || row.created_at,
      status: activityData.status || null,
    };
  });
}

export function useSpaceActivities(heapId: string) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse>({
    queryKey: ["space-activities", heapId, page],
    queryFn: async () => {
      const res = await fetch(`/api/heaps/${heapId}/activities?page=${page}`);
      if (!res.ok) {
        throw new Error("Failed to fetch activities");
      }
      return res.json();
    },
  });

  const activities = data?.data ? normalizeActivities(data.data) : [];
  const pagination = data?.pagination;

  const nextPage = () => {
    if (pagination?.hasNext) {
      setPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrev) {
      setPage((p) => p - 1);
    }
  };

  return {
    activities,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    nextPage,
    prevPage,
    page,
  };
}

