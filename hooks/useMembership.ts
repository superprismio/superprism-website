import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useIsHeapOwner(heapId: string | null) {
  return useQuery<boolean>({
    queryKey: ["heap-owner", heapId],
    queryFn: async () => {
      if (!heapId) return false;
      const response = await fetch(`/api/heaps/${heapId}/owner-check`);
      if (!response.ok) {
        return false;
      }
      const json = (await response.json()) as { data: boolean };
      return json.data === true;
    },
    enabled: !!heapId,
  });
}

type Invite = {
  invite_id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  is_used: boolean;
  used_at: string | null;
  invited_by_email: string;
  invited_by_name: string;
  heap_id: string;
};

type CreateInviteRequest = {
  email: string;
  role: "member" | "owner";
};

type CreateInviteResponse = {
  token: string;
  invite_id: string;
  invite_link: string;
};

type AcceptInviteResponse = {
  success: boolean;
  membership_id?: string;
  error?: string;
};

export function usePendingInvites(heapId: string | null) {
  return useQuery<Invite[]>({
    queryKey: ["invites", heapId],
    queryFn: async () => {
      if (!heapId) return [];
      const response = await fetch(`/api/heaps/${heapId}/invites`);
      if (!response.ok) {
        throw new Error("Unable to load invites");
      }
      const json = (await response.json()) as { data: Invite[] };
      return Array.isArray(json?.data) ? json.data : [];
    },
    enabled: !!heapId,
  });
}

export function useCreateInvite(heapId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    CreateInviteResponse,
    Error,
    CreateInviteRequest
  >({
    mutationFn: async (data) => {
      if (!heapId) throw new Error("Heap ID is required");
      const response = await fetch(`/api/heaps/${heapId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: "Failed to create invite",
        }));
        throw new Error(
          typeof error?.error === "string" ? error.error : "Failed to create invite"
        );
      }
      const json = (await response.json()) as { data: CreateInviteResponse };
      return json.data;
    },
    onSuccess: () => {
      // Refetch invites after creating
      queryClient.invalidateQueries({ queryKey: ["invites", heapId] });
    },
  });
}

export function useAcceptInvite() {
  return useMutation<AcceptInviteResponse, Error, string>({
    mutationFn: async (token) => {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: "Failed to accept invite",
        }));
        throw new Error(
          typeof error?.error === "string" ? error.error : "Failed to accept invite"
        );
      }
      const json = (await response.json()) as { data: AcceptInviteResponse };
      return json.data;
    },
  });
}

export function useInviteDetails(token: string | null) {
  return useQuery<{
    email: string | null;
    role: string | null;
    heap_id: string;
  }>({
    queryKey: ["invite", token],
    queryFn: async () => {
      if (!token) throw new Error("Token is required");
      const response = await fetch(`/api/invites/${token}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: "Failed to load invite",
        }));
        throw new Error(
          typeof error?.error === "string" ? error.error : "Failed to load invite"
        );
      }
      const json = (await response.json()) as {
        data: { email: string | null; role: string | null; heap_id: string };
      };
      return json.data;
    },
    enabled: !!token,
  });
}
