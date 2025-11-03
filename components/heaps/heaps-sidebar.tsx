"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateHeapDialog } from "./create-heap-dialog";
import type { Membership } from "./types";

export function HeapsSidebar({
  selectedHeapId,
  onMembershipChange,
}: {
  selectedHeapId: string;
  onMembershipChange?: (memberships: Membership[]) => void;
}) {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingMemberships(true);
      try {
        const res = await fetch("/api/heaps?mine=1");
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) {
          const data = json.data || [];
          setMemberships(data);
          onMembershipChange?.(data);
        }
      } finally {
        if (mounted) setLoadingMemberships(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [onMembershipChange]);

  const handleCreated = async (heap: { id: string }) => {
    const res = await fetch("/api/heaps?mine=1");
    const json = await res.json();
    if (res.ok) {
      const data = json.data || [];
      setMemberships(data);
      onMembershipChange?.(data);
    }
  };

  return (
    <aside className="w-56 border-r p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">My Spaces</div>
        <CreateHeapDialog onCreated={handleCreated} />
      </div>

      <div className="space-y-1 overflow-auto">
        {loadingMemberships && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!loadingMemberships && memberships.length === 0 && (
          <div className="text-sm text-muted-foreground">No spaces yet</div>
        )}
        {memberships.map((m) => (
          <button
            key={m.heap_id}
            onClick={() => router.push(`/heaps/${m.heap_id}`)}
            className={`w-full text-left px-2 py-2 rounded hover:bg-accent ${
              selectedHeapId === m.heap_id ? "bg-accent" : ""
            }`}
          >
            <div className="font-medium truncate">{m.heap_name}</div>
            <div className="text-xs text-muted-foreground">{m.role}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

