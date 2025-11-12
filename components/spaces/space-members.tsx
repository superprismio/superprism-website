"use client";

import { WorkspacePaneComponentProps } from "./workspace-pane-types";


import { useEffect, useState } from "react";
import type { Member } from "./types";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";

export function SpaceMembers({ heapId }: WorkspacePaneComponentProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heaps/${heapId}/members`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setMembers(json.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;  
    };
  }, [heapId]);
  return (
    <>
      <header className="gap-4 border-b w-full px-3 py-4 flex justify-between">
        <h3 className="font-semibold text-foreground">Members</h3>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground px-3 py-4">
          {loading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {!loading && members.length === 0 && (
            <div className="text-sm text-muted-foreground">No members</div>
          )}
          {!loading &&
            members.map((m) => (
              <div key={m.membership_id} className="text-sm">
                <span className="font-medium">
                  {m.display_name || m.user_name || m.user_email}
                </span>
                <span className="text-muted-foreground"> — {m.role}</span>
              </div>
            ))}

<Button>
  <PlusIcon className="w-4 h-4" />
        Invite member
      </Button>
      </div>
    </>
  );
}

